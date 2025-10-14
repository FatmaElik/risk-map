import { useEffect, useRef, useMemo, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { ChevronDown, ChevronUp } from 'lucide-react';
import useAppStore from '../state/useAppStore';
import { extractScatterData } from '../data/loadData';
import { getMetricLabel, getMetricShortLabel, formatMetric } from '../utils/format';
import { getColor } from '../utils/color';
import { getBins } from '../data/bins';
import UiSelect from './ui/UiSelect';
import { t } from '../i18n';
import { getRiskColor } from '../lib/riskScale';

/**
 * Scatter plot panel with district filtering and neighborhood selection (collapsible)
 */
export default function ScatterPanel() {
  const canvasRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);
  
  const {
    geojsonData,
    csvData,
    scatterXMetric,
    scatterYMetric,
    setScatterXMetric,
    setScatterYMetric,
    selectedDistricts,
    selectedCities,
    setSelectedNeighborhood,
    ui,
    setUiFlag,
  } = useAppStore();
  
  const isOpen = ui.scatterOpen;
  
  // Extract scatter data from GeoJSON or CSV
  const scatterData = useMemo(() => {
    const points = extractScatterData(csvData, geojsonData);
    
    // Debug: Check risk score range
    if (points.length > 0) {
      const riskScores = points.map(p => p.risk_score).filter(v => Number.isFinite(v));
      if (riskScores.length > 0) {
        console.log('🎨 Risk score range:', {
          min: Math.min(...riskScores),
          max: Math.max(...riskScores),
          count: riskScores.length
        });
      }
    }
    
    // Filter by cities
    let filtered = points;
    if (selectedCities.length < 2) {
      filtered = filtered.filter(p => selectedCities.includes(p.city));
    }
    
    // Filter by districts
    if (selectedDistricts.length > 0) {
      filtered = filtered.filter(p => selectedDistricts.includes(p.district));
    }
    
    // Filter out invalid points
    return filtered.filter(p => 
      Number.isFinite(p[scatterXMetric]) && 
      Number.isFinite(p[scatterYMetric])
    );
  }, [geojsonData, csvData, scatterXMetric, scatterYMetric, selectedDistricts, selectedCities]);
  
  // Color bins no longer needed - using centralized risk scale
  
  // Render scatter plot
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || scatterData.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;
    const padding = { top: 30, right: 20, bottom: 50, left: 60 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate scales
    const xValues = scatterData.map(d => d[scatterXMetric]);
    const yValues = scatterData.map(d => d[scatterYMetric]);
    
    const xScale = scaleLinear()
      .domain([Math.min(...xValues), Math.max(...xValues)])
      .range([padding.left, padding.left + plotWidth])
      .nice();
    
    const yScale = scaleLinear()
      .domain([Math.min(...yValues), Math.max(...yValues)])
      .range([padding.top + plotHeight, padding.top])
      .nice();
    
    // Draw axes
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 1;
    
    // X axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + plotHeight);
    ctx.lineTo(padding.left + plotWidth, padding.top + plotHeight);
    ctx.stroke();
    
    // Y axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + plotHeight);
    ctx.stroke();
    
    // Draw axis labels
    ctx.fillStyle = '#6B7280';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    
    // X axis label
    ctx.fillText(
      getMetricShortLabel(scatterXMetric),
      padding.left + plotWidth / 2,
      height - 10
    );
    
    // Y axis label
    ctx.save();
    ctx.translate(15, padding.top + plotHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(getMetricShortLabel(scatterYMetric), 0, 0);
    ctx.restore();
    
    // Draw grid lines
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth = 0.5;
    
    const xTicks = xScale.ticks(5);
    const yTicks = yScale.ticks(5);
    
    xTicks.forEach(tick => {
      const x = xScale(tick);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + plotHeight);
      ctx.stroke();
      
      ctx.fillStyle = '#9CA3AF';
      ctx.textAlign = 'center';
      ctx.fillText(tick.toFixed(0), x, padding.top + plotHeight + 20);
    });
    
    yTicks.forEach(tick => {
      const y = yScale(tick);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + plotWidth, y);
      ctx.stroke();
      
      ctx.fillStyle = '#9CA3AF';
      ctx.textAlign = 'right';
      ctx.fillText(tick.toFixed(0), padding.left - 10, y + 4);
    });
    
    // Draw points
    scatterData.forEach((point, idx) => {
      const x = xScale(point[scatterXMetric]);
      const y = yScale(point[scatterYMetric]);
      
      // Get color based on risk_score using centralized scale
      const color = getRiskColor(point.risk_score);
      
      ctx.fillStyle = color;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Store point data for hover detection
      point._x = x;
      point._y = y;
      point._idx = idx;
    });
    
  }, [scatterData, scatterXMetric, scatterYMetric]);
  
  // Handle mouse move for tooltip
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find nearest point
    let nearest = null;
    let minDist = 10; // Threshold in pixels
    
    scatterData.forEach(point => {
      if (!point._x || !point._y) return;
      const dist = Math.sqrt((point._x - x) ** 2 + (point._y - y) ** 2);
      if (dist < minDist) {
        minDist = dist;
        nearest = point;
      }
    });
    
    if (nearest) {
      setHoveredPoint(nearest);
      setTooltipPos({ x: e.clientX, y: e.clientY });
    } else {
      setHoveredPoint(null);
      setTooltipPos(null);
    }
  };
  
  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setTooltipPos(null);
  };
  
  const handleClick = () => {
    if (hoveredPoint) {
      setSelectedNeighborhood(hoveredPoint);
      
      // Optionally zoom to neighborhood on map
      if (window.zoomToNeighborhood) {
        window.zoomToNeighborhood(hoveredPoint.mah_id);
      }
    }
  };
  
  const metrics = ['risk_score', 'vs30_mean', 'population', 'building_count'];
  
  return (
    <div className="scatter-dock scatter-bl">
      <div
        style={{
          width: 480,
          maxWidth: 'calc(100vw - 32px)',
          height: isOpen ? 320 : 'auto',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(4px)',
          borderRadius: 12,
          padding: isOpen ? 16 : 0,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
      {/* Collapsible Header */}
      <div
        onClick={() => setUiFlag('scatterOpen', !isOpen)}
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          borderBottom: isOpen ? '1px solid #E5E7EB' : 'none',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1F2937' }}>
          {t('scatter_plot')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B7280', fontSize: 11 }}>
          <span>{scatterData.length} {t('neighborhoods')}</span>
          {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>
      </div>
      
      {/* Collapsible Content */}
      {isOpen && (
      <div className="scatter-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

      {/* Header with metric selectors */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10, color: '#374151' }}>
          Scatter Plot
          <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400, marginLeft: 8 }}>
            ({scatterData.length} neighborhoods)
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
          <div style={{ flex: 1 }}>
            <UiSelect
              label="X Axis"
              options={metrics.map(m => ({ label: getMetricLabel(m), value: m }))}
              value={scatterXMetric}
              onChange={setScatterXMetric}
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <UiSelect
              label="Y Axis"
              options={metrics.map(m => ({ label: getMetricLabel(m), value: m }))}
              value={scatterYMetric}
              onChange={setScatterYMetric}
            />
          </div>
        </div>
      </div>
      
      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          style={{
            width: '100%',
            height: '100%',
            cursor: hoveredPoint ? 'pointer' : 'default',
          }}
        />
        
        {/* Tooltip */}
        {hoveredPoint && tooltipPos && (
          <div
            style={{
              position: 'fixed',
              left: tooltipPos.x + 10,
              top: tooltipPos.y + 10,
              background: 'rgba(17, 24, 39, 0.95)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 11,
              pointerEvents: 'none',
              zIndex: 1000,
              maxWidth: 200,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {hoveredPoint.neighborhood}
            </div>
            <div style={{ opacity: 0.8, fontSize: 10, marginBottom: 6 }}>
              {hoveredPoint.district} • {hoveredPoint.city}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 8px', fontSize: 10 }}>
              <span>Risk:</span>
              <span style={{ fontWeight: 600 }}>{formatMetric('risk_score', hoveredPoint.risk_score)}</span>
              
              <span>VS30:</span>
              <span style={{ fontWeight: 600 }}>{formatMetric('vs30_mean', hoveredPoint.vs30_mean)}</span>
              
              <span>Pop:</span>
              <span style={{ fontWeight: 600 }}>{formatMetric('population', hoveredPoint.population)}</span>
              
              <span>Bldgs:</span>
              <span style={{ fontWeight: 600 }}>{formatMetric('building_count', hoveredPoint.building_count)}</span>
            </div>
            <div style={{ 
              marginTop: 6, 
              paddingTop: 6, 
              borderTop: '1px solid rgba(255,255,255,0.2)',
              fontSize: 9,
              opacity: 0.7,
            }}>
              Click to select
            </div>
          </div>
        )}
      </div>
      
      {scatterData.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#9CA3AF',
          fontSize: 12,
        }}>
          No data available for selected filters
        </div>
      )}
      </div>
      )}
      </div>
    </div>
  );
}

