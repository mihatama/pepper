// Radar Chart Module
class RadarChart {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.chart = null;
        this.isInteractive = options.interactive !== false; // Default to interactive
        this.isDragging = false;
        this.dragPointIndex = -1;
        this.onDataChange = options.onDataChange || null;
        this.options = {
            responsive: true,
            maintainAspectRatio: false,
            ...options
        };
        this.initChart();
        if (this.isInteractive) {
            this.setupInteractivity();
        }
    }

    initChart() {
        const defaultData = {
            labels: [
                window.i18n?.t('spiciness') || 'Spiciness',
                window.i18n?.t('aroma') || 'Aroma',
                window.i18n?.t('citrusy') || 'Citrusy',
                window.i18n?.t('freshness') || 'Freshness',
                window.i18n?.t('depth') || 'Depth'
            ],
            datasets: [{
                label: 'Flavor Profile',
                data: [3, 3, 3, 3, 3],
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(102, 126, 234, 1)',
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        };

        const config = {
            type: 'radar',
            data: defaultData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 5,
                        min: 1,
                        ticks: {
                            stepSize: 1,
                            color: '#666',
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        pointLabels: {
                            color: '#333',
                            font: {
                                size: 14,
                                weight: '600'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(102, 126, 234, 1)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed.r}`;
                            }
                        }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeInOutQuart'
                },
                ...this.options
            }
        };

        this.chart = new Chart(this.ctx, config);
    }

    updateData(data) {
        if (this.chart && Array.isArray(data) && data.length === 5) {
            this.chart.data.datasets[0].data = data;
            this.chart.update('active');
        }
    }

    updateLabels() {
        if (this.chart && window.i18n) {
            this.chart.data.labels = [
                window.i18n.t('flavor.spiciness'),
                window.i18n.t('flavor.aroma'),
                window.i18n.t('flavor.citrusy'),
                window.i18n.t('flavor.freshness'),
                window.i18n.t('flavor.depth')
            ];
            this.chart.update();
        }
    }

    setDatasetColor(color) {
        if (this.chart) {
            this.chart.data.datasets[0].backgroundColor = `${color}33`;
            this.chart.data.datasets[0].borderColor = color;
            this.chart.data.datasets[0].pointBackgroundColor = color;
            this.chart.data.datasets[0].pointHoverBorderColor = color;
            this.chart.update();
        }
    }

    addDataset(label, data, color) {
        if (this.chart) {
            const newDataset = {
                label: label,
                data: data,
                backgroundColor: `${color}33`,
                borderColor: color,
                borderWidth: 2,
                pointBackgroundColor: color,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: color,
                pointRadius: 6,
                pointHoverRadius: 8
            };
            this.chart.data.datasets.push(newDataset);
            this.chart.update();
        }
    }

    removeDataset(index) {
        if (this.chart && this.chart.data.datasets.length > index) {
            this.chart.data.datasets.splice(index, 1);
            this.chart.update();
        }
    }

    clearAdditionalDatasets() {
        if (this.chart) {
            this.chart.data.datasets = [this.chart.data.datasets[0]];
            this.chart.update();
        }
    }

    getData() {
        return this.chart ? this.chart.data.datasets[0].data : [3, 3, 3, 3, 3];
    }

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }

    resize() {
        if (this.chart) {
            this.chart.resize();
        }
    }

    // Calculate how close the shape is to a regular pentagon
    calculatePentagonScore(data) {
        const average = data.reduce((sum, val) => sum + val, 0) / data.length;
        const variance = data.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / data.length;
        const standardDeviation = Math.sqrt(variance);
        
        // Score from 0-100, where 100 is a perfect pentagon (all values equal)
        const maxPossibleDeviation = 50; // Maximum deviation when one value is 0 and others are 100
        const score = Math.max(0, 100 - (standardDeviation / maxPossibleDeviation) * 100);
        
        return {
            score: Math.round(score),
            average: Math.round(average),
            deviation: Math.round(standardDeviation)
        };
    }

    // Get suggestions for making the shape more pentagon-like
    getPentagonSuggestions(data) {
        const average = data.reduce((sum, val) => sum + val, 0) / data.length;
        const suggestions = [];
        
        data.forEach((value, index) => {
            const difference = average - value;
            if (Math.abs(difference) > 10) {
                const flavorName = this.getFlavorName(index);
                if (difference > 0) {
                    suggestions.push({
                        flavor: flavorName,
                        action: 'increase',
                        amount: Math.round(difference)
                    });
                } else {
                    suggestions.push({
                        flavor: flavorName,
                        action: 'decrease',
                        amount: Math.round(Math.abs(difference))
                    });
                }
            }
        });
        
        return suggestions;
    }

    getFlavorName(index) {
        const flavorKeys = ['spiciness', 'aroma', 'citrusy', 'freshness', 'depth'];
        return window.i18n ? window.i18n.t(`flavor.${flavorKeys[index]}`) : flavorKeys[index];
    }

    // Setup interactive functionality
    setupInteractivity() {
        if (!this.canvas) return;

        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleEnd(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleEnd(e));

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleStart(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleMove(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleEnd(e);
        });

        // Change cursor style
        this.canvas.style.cursor = 'pointer';
    }

    // Handle start of interaction (mouse down / touch start)
    handleStart(event) {
        if (!this.chart) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Get the point that was clicked
        const pointIndex = this.getPointAtPosition(x, y);
        
        if (pointIndex !== -1) {
            this.isDragging = true;
            this.dragPointIndex = pointIndex;
            this.canvas.style.cursor = 'grabbing';
        }
    }

    // Handle movement during interaction
    handleMove(event) {
        if (!this.chart || !this.isDragging || this.dragPointIndex === -1) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Calculate new value based on distance from center
        const newValue = this.calculateValueFromPosition(x, y, this.dragPointIndex);
        
        if (newValue !== null) {
            // Update the data
            const currentData = [...this.chart.data.datasets[0].data];
            currentData[this.dragPointIndex] = newValue;
            
            this.chart.data.datasets[0].data = currentData;
            this.chart.update('none'); // Update without animation for smooth dragging
            
            // Call callback if provided
            if (this.onDataChange) {
                this.onDataChange(currentData);
            }
        }
    }

    // Handle end of interaction
    handleEnd(event) {
        if (this.isDragging) {
            this.isDragging = false;
            this.dragPointIndex = -1;
            this.canvas.style.cursor = 'pointer';
        }
    }

    // Get point index at given position
    getPointAtPosition(x, y) {
        if (!this.chart) return -1;

        const canvasPosition = Chart.helpers.getRelativePosition(
            { x, y }, 
            this.chart
        );
        
        const datasetIndex = 0;
        const elements = this.chart.getElementsAtEventForMode(
            { x, y },
            'nearest',
            { intersect: true },
            true
        );

        if (elements.length > 0) {
            return elements[0].index;
        }

        return -1;
    }

    // Calculate value from position
    calculateValueFromPosition(x, y, pointIndex) {
        if (!this.chart) return null;

        const chartArea = this.chart.chartArea;
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;
        
        // Calculate the angle for this point (starting from top, going clockwise)
        const anglePerPoint = (2 * Math.PI) / 5; // 5 points
        const pointAngle = (pointIndex * anglePerPoint) - (Math.PI / 2); // Start from top
        
        // Calculate the direction vector from center to the point
        const directionX = Math.cos(pointAngle);
        const directionY = Math.sin(pointAngle);
        
        // Calculate the projection of mouse position onto the direction vector
        const mouseVectorX = x - centerX;
        const mouseVectorY = y - centerY;
        
        // Project mouse vector onto the direction vector
        const projection = (mouseVectorX * directionX + mouseVectorY * directionY);
        
        // Get the maximum radius for value 5
        const maxRadius = Math.min(
            (chartArea.right - chartArea.left) / 2,
            (chartArea.bottom - chartArea.top) / 2
        ) * 0.8; // 80% of available space
        
        // Convert projection to value (1-5 scale)
        const normalizedProjection = Math.max(0, Math.min(1, projection / maxRadius));
        const value = Math.round(1 + (normalizedProjection * 4)); // Convert to 1-5 scale
        
        return Math.max(1, Math.min(5, value));
    }

    // Enable/disable interactivity
    setInteractive(interactive) {
        this.isInteractive = interactive;
        if (interactive) {
            this.setupInteractivity();
        } else {
            this.removeInteractivity();
        }
    }

    // Remove interactive functionality
    removeInteractivity() {
        if (!this.canvas) return;

        // Remove all event listeners
        this.canvas.removeEventListener('mousedown', this.handleStart);
        this.canvas.removeEventListener('mousemove', this.handleMove);
        this.canvas.removeEventListener('mouseup', this.handleEnd);
        this.canvas.removeEventListener('mouseleave', this.handleEnd);
        this.canvas.removeEventListener('touchstart', this.handleStart);
        this.canvas.removeEventListener('touchmove', this.handleMove);
        this.canvas.removeEventListener('touchend', this.handleEnd);

        this.canvas.style.cursor = 'default';
    }
}

// Chart Manager for handling multiple charts
class ChartManager {
    constructor() {
        this.charts = new Map();
        this.initializeCharts();
        this.setupLanguageListener();
    }

    initializeCharts() {
        // Initialize charts when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createCharts());
        } else {
            this.createCharts();
        }
    }

    createCharts() {
        // Manual blend chart with interactive functionality
        if (document.getElementById('radarChart')) {
            this.charts.set('manual', new RadarChart('radarChart', {
                interactive: true,
                onDataChange: (data) => {
                    // Update sliders when chart is dragged
                    this.updateSlidersFromChart(data);
                    // Update pepper blend calculation
                    if (window.app && window.app.updateManualBlend) {
                        window.app.updateManualBlendFromChart(data);
                    }
                }
            }));
        }

        // AI taste chart (non-interactive)
        if (document.getElementById('aiRadarChart')) {
            this.charts.set('aiTaste', new RadarChart('aiRadarChart', {
                interactive: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }));
        }

        // Dish charts (non-interactive)
        if (document.getElementById('dishRadarChart')) {
            this.charts.set('dish', new RadarChart('dishRadarChart', {
                interactive: false
            }));
        }

        if (document.getElementById('enhancedRadarChart')) {
            this.charts.set('enhanced', new RadarChart('enhancedRadarChart', {
                interactive: false
            }));
        }
    }

    // Update sliders when chart is dragged
    updateSlidersFromChart(data) {
        const sliders = document.querySelectorAll('.slider');
        sliders.forEach((slider, index) => {
            if (index < data.length) {
                slider.value = data[index];
                const valueDisplay = slider.parentNode.querySelector('.slider-value');
                if (valueDisplay) {
                    valueDisplay.textContent = data[index];
                }
            }
        });
    }

    setupLanguageListener() {
        window.addEventListener('languageChanged', () => {
            this.updateAllLabels();
        });
    }

    getChart(name) {
        return this.charts.get(name);
    }

    updateChart(name, data) {
        const chart = this.charts.get(name);
        if (chart) {
            chart.updateData(data);
        }
    }

    updateAllLabels() {
        this.charts.forEach(chart => {
            chart.updateLabels();
        });
    }

    resizeAll() {
        this.charts.forEach(chart => {
            chart.resize();
        });
    }

    destroyAll() {
        this.charts.forEach(chart => {
            chart.destroy();
        });
        this.charts.clear();
    }
}

// Initialize chart manager
const chartManager = new ChartManager();

// Export for global use
window.RadarChart = RadarChart;
window.chartManager = chartManager;

// Handle window resize
window.addEventListener('resize', () => {
    chartManager.resizeAll();
});
