// Radar Chart Module
class RadarChart {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.chart = null;
        this.options = {
            responsive: true,
            maintainAspectRatio: false,
            ...options
        };
        this.initChart();
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
        // Manual blend chart
        if (document.getElementById('radarChart')) {
            this.charts.set('manual', new RadarChart('radarChart'));
        }

        // AI taste chart
        if (document.getElementById('aiRadarChart')) {
            this.charts.set('aiTaste', new RadarChart('aiRadarChart', {
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }));
        }

        // Dish charts
        if (document.getElementById('dishRadarChart')) {
            this.charts.set('dish', new RadarChart('dishRadarChart'));
        }

        if (document.getElementById('enhancedRadarChart')) {
            this.charts.set('enhanced', new RadarChart('enhancedRadarChart'));
        }
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
