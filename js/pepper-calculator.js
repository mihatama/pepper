// Pepper Calculator Module
class PepperCalculator {
    constructor() {
        this.pepperTypes = {
            red: {
                name: 'red',
                spiciness: 0.8,
                aroma: 0.6,
                citrusy: 0.3,
                freshness: 0.2,
                depth: 0.7
            },
            pink: {
                name: 'pink',
                spiciness: 0.3,
                aroma: 0.9,
                citrusy: 0.8,
                freshness: 0.6,
                depth: 0.4
            },
            black: {
                name: 'black',
                spiciness: 0.7,
                aroma: 0.7,
                citrusy: 0.2,
                freshness: 0.3,
                depth: 0.9
            },
            green: {
                name: 'green',
                spiciness: 0.5,
                aroma: 0.5,
                citrusy: 0.4,
                freshness: 0.9,
                depth: 0.6
            },
            coriander: {
                name: 'coriander',
                spiciness: 0.2,
                aroma: 0.8,
                citrusy: 0.7,
                freshness: 0.7,
                depth: 0.8
            }
        };
        
        this.baseAmount = 100; // Base amount in grams
    }

    // Calculate pepper blend based on flavor profile
    calculateBlend(flavorProfile) {
        // Normalize flavor profile to 0-1 scale
        const normalizedProfile = flavorProfile.map(value => value / 100);
        
        // Initialize blend ratios
        const blend = {};
        Object.keys(this.pepperTypes).forEach(pepper => {
            blend[pepper] = 0;
        });

        // Calculate how much each pepper contributes to each flavor
        const contributions = {};
        Object.keys(this.pepperTypes).forEach(pepper => {
            contributions[pepper] = this.calculatePepperContribution(
                this.pepperTypes[pepper], 
                normalizedProfile
            );
        });

        // Solve for optimal blend using weighted approach
        const totalContribution = Object.values(contributions).reduce((sum, val) => sum + val, 0);
        
        if (totalContribution > 0) {
            Object.keys(contributions).forEach(pepper => {
                blend[pepper] = (contributions[pepper] / totalContribution) * this.baseAmount;
            });
        } else {
            // Fallback: equal distribution
            const equalAmount = this.baseAmount / Object.keys(this.pepperTypes).length;
            Object.keys(blend).forEach(pepper => {
                blend[pepper] = equalAmount;
            });
        }

        // Ensure minimum amounts and round
        return this.normalizeBlend(blend);
    }

    // Calculate how well a pepper matches the desired profile
    calculatePepperContribution(pepper, targetProfile) {
        const pepperProfile = [
            pepper.spiciness,
            pepper.aroma,
            pepper.citrusy,
            pepper.freshness,
            pepper.depth
        ];

        // Calculate dot product (similarity)
        let similarity = 0;
        for (let i = 0; i < 5; i++) {
            similarity += pepperProfile[i] * targetProfile[i];
        }

        // Weight by target intensity
        const targetIntensity = targetProfile.reduce((sum, val) => sum + val, 0) / 5;
        
        return similarity * targetIntensity;
    }

    // Normalize blend to ensure reasonable amounts
    normalizeBlend(blend) {
        const normalized = {};
        let total = 0;

        // Set minimum amounts (5% of base amount)
        const minAmount = this.baseAmount * 0.05;
        
        Object.keys(blend).forEach(pepper => {
            normalized[pepper] = Math.max(minAmount, blend[pepper]);
            total += normalized[pepper];
        });

        // Scale to maintain base amount
        const scale = this.baseAmount / total;
        Object.keys(normalized).forEach(pepper => {
            normalized[pepper] = Math.round(normalized[pepper] * scale * 10) / 10;
        });

        return normalized;
    }

    // Calculate enhanced blend for dish completion (make pentagon more regular)
    calculateEnhancedBlend(currentProfile, targetRegularity = 0.8) {
        // Calculate what the profile should look like for better pentagon shape
        const average = currentProfile.reduce((sum, val) => sum + val, 0) / currentProfile.length;
        const targetProfile = currentProfile.map(value => {
            // Move each value towards the average
            const difference = average - value;
            return value + (difference * targetRegularity);
        });

        // Calculate the difference needed
        const enhancement = targetProfile.map((target, index) => 
            Math.max(0, target - currentProfile[index])
        );

        // Calculate blend to provide this enhancement
        return this.calculateBlend(enhancement);
    }

    // Get pepper blend for specific dish type
    getDishBlend(dishType) {
        const dishProfiles = {
            'asian': [60, 70, 50, 80, 70],
            'italian': [40, 80, 30, 60, 90],
            'indian': [90, 85, 40, 50, 95],
            'mexican': [85, 60, 70, 60, 80],
            'french': [30, 90, 20, 70, 95],
            'mediterranean': [50, 85, 80, 75, 70],
            'american': [50, 60, 40, 60, 70],
            'thai': [80, 75, 85, 90, 75],
            'chinese': [70, 80, 30, 70, 85],
            'japanese': [40, 70, 20, 90, 80],
            'korean': [75, 65, 60, 70, 80],
            'middle_eastern': [60, 90, 50, 60, 85]
        };

        // Try to match dish type or use default
        const profile = dishProfiles[dishType.toLowerCase()] || 
                        dishProfiles['mediterranean']; // Default profile

        return this.calculateBlend(profile);
    }

    // Format blend for display
    formatBlend(blend, unit = 'grams') {
        const formatted = [];
        const unitSymbol = this.getUnitSymbol(unit);

        Object.keys(blend).forEach(pepper => {
            if (blend[pepper] > 0) {
                formatted.push({
                    name: pepper,
                    displayName: window.i18n ? window.i18n.getPepperName(pepper) : pepper,
                    amount: blend[pepper],
                    unit: unitSymbol,
                    percentage: Math.round((blend[pepper] / this.baseAmount) * 100)
                });
            }
        });

        // Sort by amount (descending)
        formatted.sort((a, b) => b.amount - a.amount);

        return formatted;
    }

    // Convert between units
    convertUnit(amount, fromUnit, toUnit) {
        const conversions = {
            'grams': 1,
            'teaspoons': 0.2, // 1 tsp ≈ 5g for ground spices
            'tablespoons': 0.067 // 1 tbsp ≈ 15g for ground spices
        };

        const gramsAmount = amount / conversions[fromUnit];
        return gramsAmount * conversions[toUnit];
    }

    // Get unit symbol
    getUnitSymbol(unit) {
        const symbols = {
            'grams': window.i18n ? window.i18n.t('units.grams') : 'g',
            'teaspoons': window.i18n ? window.i18n.t('units.teaspoons') : 'tsp',
            'tablespoons': window.i18n ? window.i18n.t('units.tablespoons') : 'tbsp'
        };
        return symbols[unit] || 'g';
    }

    // Calculate total amount
    getTotalAmount(blend) {
        return Object.values(blend).reduce((sum, amount) => sum + amount, 0);
    }

    // Get blend instructions
    getInstructions() {
        return window.i18n ? window.i18n.t('result.instructions') : 
               'Mix all ingredients thoroughly. Store in an airtight container.';
    }

    // Analyze flavor profile and suggest improvements
    analyzeProfile(profile) {
        const analysis = {
            dominant: [],
            weak: [],
            balanced: [],
            suggestions: []
        };

        const average = profile.reduce((sum, val) => sum + val, 0) / profile.length;
        const flavorNames = ['spiciness', 'aroma', 'citrusy', 'freshness', 'depth'];

        profile.forEach((value, index) => {
            const flavorName = window.i18n ? 
                window.i18n.t(`flavor.${flavorNames[index]}`) : 
                flavorNames[index];

            if (value > average + 15) {
                analysis.dominant.push(flavorName);
            } else if (value < average - 15) {
                analysis.weak.push(flavorName);
            } else {
                analysis.balanced.push(flavorName);
            }
        });

        // Generate suggestions
        if (analysis.weak.length > 0) {
            analysis.suggestions.push(
                `Consider enhancing: ${analysis.weak.join(', ')}`
            );
        }

        if (analysis.dominant.length > 2) {
            analysis.suggestions.push(
                `Profile is heavily weighted towards: ${analysis.dominant.join(', ')}`
            );
        }

        return analysis;
    }

    // Get pepper information
    getPepperInfo(pepperName) {
        const pepper = this.pepperTypes[pepperName];
        if (!pepper) return null;

        return {
            name: pepperName,
            displayName: window.i18n ? window.i18n.getPepperName(pepperName) : pepperName,
            profile: [
                Math.round(pepper.spiciness * 100),
                Math.round(pepper.aroma * 100),
                Math.round(pepper.citrusy * 100),
                Math.round(pepper.freshness * 100),
                Math.round(pepper.depth * 100)
            ],
            characteristics: this.getPepperCharacteristics(pepperName)
        };
    }

    // Get pepper characteristics description
    getPepperCharacteristics(pepperName) {
        const characteristics = {
            red: 'Hot and pungent with fruity notes',
            pink: 'Mild and aromatic with citrusy sweetness',
            black: 'Sharp and woody with earthy depth',
            green: 'Fresh and bright with herbaceous notes',
            coriander: 'Warm and citrusy with sweet undertones'
        };

        return characteristics[pepperName] || '';
    }
}

// Initialize pepper calculator
const pepperCalculator = new PepperCalculator();

// Export for global use
window.PepperCalculator = PepperCalculator;
window.pepperCalculator = pepperCalculator;
