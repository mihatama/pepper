// Main Application Module
class PepperCraftApp {
    constructor() {
        this.currentTab = 'manual';
        this.currentProfile = [50, 50, 50, 50, 50];
        this.currentBlend = null;
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupApp());
        } else {
            this.setupApp();
        }
    }

    setupApp() {
        this.setupTabs();
        this.setupManualBlend();
        this.setupAITaste();
        this.setupDishRecipe();
        this.setupServiceWorker();
        this.setupLoadingOverlay();
        
        // Initial calculation
        this.updateManualBlend();
        
        console.log('Pepper Craft AI initialized');
    }

    // Setup tab navigation
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Update active states
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                
                button.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
                
                this.currentTab = targetTab;
                
                // Resize charts when tab becomes visible
                setTimeout(() => {
                    if (window.chartManager) {
                        window.chartManager.resizeAll();
                    }
                }, 100);
            });
        });
    }

    // Setup manual blend functionality
    setupManualBlend() {
        const sliders = document.querySelectorAll('.slider');
        
        sliders.forEach(slider => {
            const valueDisplay = slider.parentNode.querySelector('.slider-value');
            
            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                valueDisplay.textContent = value;
                this.updateManualBlend();
            });
        });
    }

    // Update manual blend calculation
    updateManualBlend() {
        const sliders = document.querySelectorAll('.slider');
        const profile = Array.from(sliders).map(slider => parseInt(slider.value));
        
        this.currentProfile = profile;
        
        // Update radar chart (1-5 scale)
        if (window.chartManager) {
            window.chartManager.updateChart('manual', profile);
        }
        
        // Calculate and display blend (profile is already 1-5 scale)
        if (window.pepperCalculator) {
            // Convert 1-5 scale to 0-100 scale for pepper calculation
            const scaledProfile = profile.map(value => (value - 1) * 25); // Convert 1-5 to 0-100
            const blend = window.pepperCalculator.calculateBlend(scaledProfile);
            this.displayBlend(blend, 'pepperResult');
        }
    }

    // Update manual blend from radar chart interaction
    updateManualBlendFromChart(profile) {
        this.currentProfile = profile;
        
        // Calculate and display blend (profile is already 1-5 scale)
        if (window.pepperCalculator) {
            // Convert 1-5 scale to 0-100 scale for pepper calculation
            const scaledProfile = profile.map(value => (value - 1) * 25); // Convert 1-5 to 0-100
            const blend = window.pepperCalculator.calculateBlend(scaledProfile);
            this.displayBlend(blend, 'pepperResult');
        }
    }

    // Setup AI taste functionality
    setupAITaste() {
        const analyzeBtn = document.getElementById('analyzeBtn');
        const tasteInput = document.getElementById('tasteInput');
        
        if (analyzeBtn && tasteInput) {
            analyzeBtn.addEventListener('click', () => {
                const description = tasteInput.value.trim();
                if (description) {
                    this.analyzeTaste(description);
                } else {
                    this.showError(window.i18n ? window.i18n.t('errors.invalidInput') : 'Please enter a description');
                }
            });
            
            // Also trigger on Enter key
            tasteInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    analyzeBtn.click();
                }
            });
        }
    }

    // Analyze taste using AI
    async analyzeTaste(description) {
        this.showLoading(window.i18n ? window.i18n.t('loading.analyzing') : 'Analyzing taste profile...');
        
        try {
            const result = await window.geminiAPI.analyzeTaste(description);
            
            console.log('AI Taste Analysis Result:', result); // Debug log
            
            // Update current profile for AI taste
            this.currentProfile = result.profile;
            
            // Update AI radar chart
            if (window.chartManager) {
                window.chartManager.updateChart('aiTaste', result.profile);
            }
            
            // Calculate and display blend (result.profile is already 1-5 scale)
            if (window.pepperCalculator) {
                // Convert 1-5 scale to 0-100 scale for pepper calculation
                const scaledProfile = result.profile.map(value => (value - 1) * 25);
                const blend = window.pepperCalculator.calculateBlend(scaledProfile);
                console.log('Calculated Blend:', blend); // Debug log
                this.displayBlend(blend, 'aiPepperResult');
                this.currentBlend = blend; // Store current blend
            } else {
                console.error('pepperCalculator not available');
            }
            
            this.showSuccess(window.i18n ? window.i18n.t('success.tasteAnalyzed') : 'Taste analyzed successfully!');
            
        } catch (error) {
            console.error('Taste analysis error:', error);
            this.showError(window.i18n ? window.i18n.t('errors.tasteAnalysisFailed') : 'Failed to analyze taste');
        } finally {
            this.hideLoading();
        }
    }

    // Setup dish recipe functionality
    setupDishRecipe() {
        const generateBtn = document.getElementById('generateBtn');
        const dishInput = document.getElementById('dishInput');
        
        if (generateBtn && dishInput) {
            generateBtn.addEventListener('click', () => {
                const dishName = dishInput.value.trim();
                if (dishName) {
                    this.generateDishRecipe(dishName);
                } else {
                    this.showError(window.i18n ? window.i18n.t('errors.invalidInput') : 'Please enter a dish name');
                }
            });
            
            // Also trigger on Enter key
            dishInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    generateBtn.click();
                }
            });
        }
    }

    // Generate dish recipe using AI
    async generateDishRecipe(dishName) {
        // Show initial loading
        this.showLoading(window.i18n ? window.i18n.t('loading.generating') : 'Generating recipe...');
        
        try {
            // Step 1: Show image generation progress
            this.updateLoadingMessage('🎨 AI画像生成中...');
            const imagePromise = window.geminiAPI.generateDishImage(dishName);
            
            // Step 2: Show dish analysis progress
            this.updateLoadingMessage('🧠 料理分析中...');
            const dishAnalysisPromise = window.geminiAPI.analyzeDish(dishName);
            
            // Wait for both to complete
            this.updateLoadingMessage('⚡ 最終処理中...');
            const [imageUrl, dishAnalysis] = await Promise.all([
                imagePromise,
                dishAnalysisPromise
            ]);
            
            // Display dish image
            this.displayDishImage(imageUrl, dishName);
            
            // Update dish radar chart
            if (window.chartManager) {
                window.chartManager.updateChart('dish', dishAnalysis.profile);
            }
            
            // Calculate pepper blend for enhancement (to make more pentagon-like)
            const targetProfile = this.calculateEnhancedProfile(dishAnalysis.profile);
            const enhancementNeeded = targetProfile.map((target, index) => 
                Math.max(0, target - dishAnalysis.profile[index])
            );
            
            // Calculate enhanced profile with peppers (original + pepper contribution)
            const pepperContribution = this.calculatePepperContribution(enhancementNeeded);
            const enhancedWithPeppers = dishAnalysis.profile.map((original, index) => 
                Math.min(5, original + pepperContribution[index])
            );
            
            // Update enhanced radar chart
            if (window.chartManager) {
                const enhancedChart = window.chartManager.getChart('enhanced');
                if (enhancedChart) {
                    enhancedChart.clearAdditionalDatasets();
                    enhancedChart.updateData(dishAnalysis.profile);
                    enhancedChart.addDataset('Enhanced with Peppers', enhancedWithPeppers, '#27ae60');
                }
            }
            
            if (window.pepperCalculator) {
                // Convert 1-5 scale to 0-100 scale for pepper calculation
                const scaledEnhancement = enhancementNeeded.map(value => value * 25);
                const blend = window.pepperCalculator.calculateBlend(scaledEnhancement);
                this.displayBlend(blend, 'dishPepperResult');
            }
            
            this.showSuccess(window.i18n ? window.i18n.t('success.recipeGenerated') : 'Recipe generated successfully!');
            
        } catch (error) {
            console.error('Dish generation error:', error);
            this.showError(window.i18n ? window.i18n.t('errors.imageGenerationFailed') : 'Failed to generate recipe');
        } finally {
            this.hideLoading();
        }
    }

    // Calculate enhanced profile for better pentagon shape
    calculateEnhancedProfile(originalProfile) {
        const average = originalProfile.reduce((sum, val) => sum + val, 0) / originalProfile.length;
        const targetRegularity = 0.7; // How much to move towards regular pentagon
        
        return originalProfile.map(value => {
            const difference = average - value;
            return Math.round(value + (difference * targetRegularity));
        });
    }

    // Calculate pepper contribution to flavor profile
    calculatePepperContribution(enhancementNeeded) {
        // ペッパーの種類ごとの味への貢献度（1-5スケール）
        const pepperProfiles = {
            white: [3, 4, 1, 2, 4],    // マイルドな辛味、香り、深み
            pink: [2, 4, 3, 4, 2],     // マイルドで香り高い
            black: [3, 5, 2, 2, 5],    // 深い香りと複雑さ
            green: [2, 3, 4, 5, 3],    // フレッシュで酸味
            coriander: [1, 4, 3, 3, 4] // 香りと深み
        };

        // 必要な強化量に基づいてペッパーの貢献度を計算
        const contribution = [0, 0, 0, 0, 0];
        
        enhancementNeeded.forEach((needed, index) => {
            if (needed > 0) {
                // 各ペッパーの貢献度を重み付けして加算
                Object.values(pepperProfiles).forEach(profile => {
                    const pepperContribution = (profile[index] / 5) * needed * 0.3; // 30%の貢献度
                    contribution[index] += pepperContribution;
                });
            }
        });

        // 1-5の範囲に正規化
        return contribution.map(value => Math.min(2, Math.max(0, value)));
    }

    // Display dish image with enhanced loading and error handling
    displayDishImage(imageUrl, dishName) {
        const container = document.getElementById('dishImageContainer');
        if (!container) return;

        // Show loading state
        container.classList.add('loading');
        container.innerHTML = '<div class="image-placeholder">Loading image...</div>';

        // Create image element
        const img = document.createElement('img');
        img.className = 'dish-image';
        img.alt = dishName;
        
        // Handle image load success
        img.onload = () => {
            container.classList.remove('loading');
            container.innerHTML = '';
            container.appendChild(img);
            
            // Add fade-in animation
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                img.style.opacity = '1';
            }, 100);
        };
        
        // Handle image load error
        img.onerror = () => {
            container.classList.remove('loading');
            console.log('Image failed to load, generating fallback...');
            
            // Generate fallback canvas image
            const fallbackUrl = window.geminiAPI.getEnhancedDishImage(dishName);
            const fallbackImg = document.createElement('img');
            fallbackImg.className = 'dish-image';
            fallbackImg.alt = dishName;
            fallbackImg.src = fallbackUrl;
            
            container.innerHTML = '';
            container.appendChild(fallbackImg);
            
            // Add fade-in animation
            fallbackImg.style.opacity = '0';
            fallbackImg.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                fallbackImg.style.opacity = '1';
            }, 100);
        };
        
        // Set image source
        if (imageUrl.startsWith('data:') || imageUrl.startsWith('http')) {
            img.src = imageUrl;
        } else {
            // Handle base64 data
            img.src = `data:image/jpeg;base64,${imageUrl}`;
        }
    }

    // Display pepper blend results
    displayBlend(blend, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !window.pepperCalculator) return;
        
        const formattedBlend = window.pepperCalculator.formatBlend(blend);
        const totalAmount = window.pepperCalculator.getTotalAmount(blend);
        const instructions = window.pepperCalculator.getInstructions();
        
        let html = '';
        
        // Add blend items
        formattedBlend.forEach(item => {
            html += `
                <div class="pepper-item">
                    <span class="pepper-name">${item.displayName}</span>
                    <span class="pepper-amount">${item.amount}${item.unit} (${item.percentage}%)</span>
                </div>
            `;
        });
        
        // Add total and instructions
        html += `
            <div class="pepper-item" style="border-left-color: #2c3e50; margin-top: 1rem;">
                <span class="pepper-name">${window.i18n ? window.i18n.t('totalAmount') : 'Total Amount'}</span>
                <span class="pepper-amount">${totalAmount.toFixed(1)}g</span>
            </div>
            <div style="margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; font-size: 0.9rem; color: #666;">
                ${instructions}
            </div>
        `;
        
        container.innerHTML = html;
    }

    // Loading overlay management
    setupLoadingOverlay() {
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }

    showLoading(message = null) {
        if (this.loadingOverlay) {
            if (message) {
                const loadingText = this.loadingOverlay.querySelector('p');
                if (loadingText) {
                    loadingText.textContent = message;
                }
            }
            this.loadingOverlay.classList.add('show');
            this.isLoading = true;
        }
    }

    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('show');
            this.isLoading = false;
        }
    }

    updateLoadingMessage(message) {
        if (this.loadingOverlay && this.isLoading) {
            const loadingText = this.loadingOverlay.querySelector('p');
            if (loadingText) {
                loadingText.textContent = message;
            }
        }
    }

    // Notification system
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            info: '#3498db'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            z-index: 1002;
            max-width: 350px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Setup service worker for PWA
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }

    // Utility methods
    getCurrentProfile() {
        return this.currentProfile;
    }

    getCurrentBlend() {
        return this.currentBlend;
    }

    getCurrentTab() {
        return this.currentTab;
    }

    // Export functionality
    exportBlend(format = 'json') {
        if (!this.currentBlend) return null;
        
        const data = {
            profile: this.currentProfile,
            blend: this.currentBlend,
            timestamp: new Date().toISOString(),
            app: 'Pepper Craft AI'
        };
        
        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        }
        
        return data;
    }

    // Import functionality
    importBlend(data) {
        try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            
            if (parsed.profile && Array.isArray(parsed.profile) && parsed.profile.length === 5) {
                this.currentProfile = parsed.profile;
                
                // Update sliders
                const sliders = document.querySelectorAll('.slider');
                sliders.forEach((slider, index) => {
                    slider.value = parsed.profile[index];
                    const valueDisplay = slider.parentNode.querySelector('.slider-value');
                    if (valueDisplay) {
                        valueDisplay.textContent = parsed.profile[index];
                    }
                });
                
                // Update display
                this.updateManualBlend();
                
                return true;
            }
        } catch (error) {
            console.error('Import error:', error);
        }
        
        return false;
    }
}

// Initialize the application
const app = new PepperCraftApp();

// Export for global use
window.PepperCraftApp = PepperCraftApp;
window.app = app;

// Handle app installation prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button or notification
    console.log('App can be installed');
});

window.addEventListener('appinstalled', (evt) => {
    console.log('App was installed');
});

// Handle online/offline status
window.addEventListener('online', () => {
    app.showSuccess('Connection restored');
});

window.addEventListener('offline', () => {
    app.showNotification('Working offline', 'info');
});
