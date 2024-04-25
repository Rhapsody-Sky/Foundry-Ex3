export class RollForm extends FormApplication {
    constructor(actor, options, object, data) {
        super(object, options);
        this.actor = actor;

        if (data.rollId) {
            this.object = duplicate(this.actor.system.savedRolls[data.rollId]);
            this.object.skipDialog = data.skipDialog || true;
            this.object.isSavedRoll = true;
        }
        else {
            this.object.isSavedRoll = false;
            this.object.skipDialog = data.skipDialog || true;
            this.object.crashed = false;
            this.object.dice = data.dice || 0;
            this.object.diceModifier = 0;
            this.object.successes = data.successModifier || 0;
            this.object.successModifier = data.successModifier || 0;
            this.object.craftType = data.craftType || 0;
            this.object.craftRating = data.craftRating || 0;
            this.object.splitAttack = false;
            this.object.rollType = data.rollType;
            this.object.targetStat = 'defense';
            this.object.attackType = data.attackType || data.rollType || 'withering';
            if (this.object.rollType === 'damage' || this.object.rollType === 'accuracy') {
                this.object.attackType = 'withering';
            }
            if (data.rollType === 'withering-split') {
                this.object.rollType = 'accuracy';
                this.object.splitAttack = true;
                this.object.attackType = 'withering';
            }
            else if (data.rollType === 'decisive-split') {
                this.object.rollType = 'accuracy';
                this.object.splitAttack = true;
                this.object.attackType = 'decisive';
            }
            else if (data.rollType === 'gambit-split') {
                this.object.rollType = 'accuracy';
                this.object.splitAttack = true;
                this.object.attackType = 'gambit';
            }
            this.object.cost = {
                motes: 0,
                penumbra: 0,
                muteMotes: 0,
                willpower: 0,
                initiative: 0,
                anima: 0,
                healthbashing: 0,
                healthlethal: 0,
                healthaggravated: 0,
                grappleControl: 0,
                silverxp: 0,
                goldxp: 0,
                whitexp: 0,
                aura: "",
            };
            this.object.restore = {
                motes: 0,
                willpower: 0,
                health: 0,
                initiative: 0
            };
            this.object.showPool = !this._isAttackRoll();
            this.object.showWithering = this.object.attackType === 'withering' || this.object.rollType === 'damage';
            this.object.hasDifficulty = (['ability', 'command', 'grappleControl', 'readIntentions', 'social', 'craft', 'working', 'rout', 'craftAbilityRoll', 'martialArt', 'rush', 'disengage', 'prophecy', 'steady', 'simpleCraft'].indexOf(data.rollType) !== -1);
            this.object.hasIntervals = (['craft', 'prophecy', 'working',].indexOf(data.rollType) !== -1);
            this.object.stunt = "none";
            this.object.goalNumber = 0;
            this.object.woundPenalty = this.object.rollType === 'base' ? false : true;
            this.object.intervals = 0;
            this.object.difficulty = data.difficulty || 0;
            this.object.resolve = 0;
            this.object.guile = 0;
            this.object.attackEffectPreset = data.attackEffectPreset || 'none';
            this.object.attackEffect = data.attackEffect || '';
            this.object.weaponAccuracy = 0;
            this.object.charmDiceAdded = 0;
            this.object.triggerSelfDefensePenalty = 0;
            this.object.triggerTargetDefensePenalty = 0;
            this.object.triggerKnockdown = false;
            this.object.triggerFullDefense = false;
            this.object.macroMessages = '';

            this.object.overwhelming = data.overwhelming || 0;
            this.object.soak = 0;
            this.object.shieldInitiative = 0;
            this.object.armoredSoak = 0;
            this.object.naturalSoak = 0;
            this.object.defense = 0;
            this.object.hardness = 0;
            this.object.characterInitiative = 0;
            this.object.gambitDifficulty = 0;
            this.object.maxCraftXP = 5;
            this.object.craftProjectId = data.craftProjectId || '';
            this.object.addedCharmsDropdown = this.object.rollType === 'useOpposingCharms';

            this.object.gambit = 'none';
            this.object.weaponTags = {};

            this.object.weaponType = data.weaponType || 'melee';
            this.object.range = 'close';

            this.object.isFlurry = false;
            this.object.armorPenalty = (this.object.rollType === 'rush' || this.object.rollType === 'disengage');
            this.object.willpower = false;

            this.object.supportedIntimacy = 0;
            this.object.opposedIntimacy = 0;
            this.object.applyAppearance = false;
            this.object.appearanceBonus = 0;

            this.object.doubleSuccess = 10;
            this.object.rerollFailed = false;
            this.object.rollTwice = false;
            this.object.targetNumber = 7;
            this.object.rerollNumber = 0;
            this.object.rerollSuccesses = 0;
            this.object.attackSuccesses = 0;

            this.object.reroll = {
                one: { status: false, number: 1, cap: 0 },
                two: { status: false, number: 2, cap: 0 },
                three: { status: false, number: 3, cap: 0 },
                four: { status: false, number: 4, cap: 0 },
                five: { status: false, number: 5, cap: 0 },
                six: { status: false, number: 6, cap: 0 },
                seven: { status: false, number: 7, cap: 0 },
                eight: { status: false, number: 8, cap: 0 },
                nine: { status: false, number: 9, cap: 0 },
                ten: { status: false, number: 10, cap: 0 },
            }

            this.object.damage = {
                damageDice: data.damage || 0,
                damageSuccessModifier: data.damageSuccessModifier || 0,
                doubleSuccess: data.doubleSuccess || ((this.object.attackType === 'decisive' || this.actor?.system?.battlegroup) ? 11 : 10),
                targetNumber: data.targetNumber || 7,
                postSoakDamage: 0,
                reroll: {
                    one: { status: false, number: 1, cap: 0 },
                    two: { status: false, number: 2, cap: 0 },
                    three: { status: false, number: 3, cap: 0 },
                    four: { status: false, number: 4, cap: 0 },
                    five: { status: false, number: 5, cap: 0 },
                    six: { status: false, number: 6, cap: 0 },
                    seven: { status: false, number: 7, cap: 0 },
                    eight: { status: false, number: 8, cap: 0 },
                    nine: { status: false, number: 9, cap: 0 },
                    ten: { status: false, number: 10, cap: 0 },
                },
                triggerOnTens: 'none',
                triggerTensCap: 0,
                type: 'lethal',
                threshholdToDamage: false,
                resetInit: true,
                maxInitiativeGain: null,
                doubleRolledDamage: false,
                doublePreRolledDamage: false,
                ignoreSoak: 0,
                ignoreHardness: 0,
                gainInitiative: !this.actor?.system?.battlegroup,
                multiTargetMinimumInitiative: 0,
                rerollFailed: false,
                rollTwice: false,
                rerollNumber: 0,
                rerollSuccesses: 0,
                decisiveDamageType: 'initiative',
                decisiveDamageCalculation: 'evenSplit',
                diceToSuccesses: 0,
            };
            this.object.poison = null;
            this.object.settings = {
                doubleSucccessCaps: {
                    sevens: 0,
                    eights: 0,
                    nines: 0,
                    tens: 0
                },
                excludeOnesFromRerolls: false,
                triggerOnOnes: 'none',
                alsoTriggerTwos: false,
                triggerOnesCap: 0,
                triggerOnTens: 'none',
                alsoTriggerNines: false,
                triggerTensCap: 0,
                ignoreLegendarySize: false,
                damage: {
                    doubleSucccessCaps: {
                        sevens: 0,
                        eights: 0,
                        nines: 0,
                        tens: 0
                    },
                    excludeOnesFromRerolls: false,
                    triggerOnOnes: 'none',
                    triggerOnTens: 'none',
                    alsoTriggerTwos: false,
                    alsoTriggerNines: false,
                    triggerTensCap: 0,
                }
            }
            this.object.activateAura = 'none';
            this.object.addStatuses = [];
            this.object.addSelfStatuses = [];
            this.object.addOppose = {
                defense: 0,
                dice: 0,
                soak: 0,
                guile: 0,
                resolve: 0,
                hardness: 0,
            }
            this.object.craft = {
                divineInsperationTechnique: false,
                holisticMiracleUnderstanding: false,
            };
            this.object.triggers = [];
            this.object.spell = "";
            if (this.object.rollType !== 'base') {
                this.object.characterType = this.actor.type;

                if (this.actor.type === 'character') {
                    if (this._isAttackRoll()) {
                        this.object.attribute = this.actor.system.settings.rollsettings['attacks'].attribute;
                        this.object.ability = this.actor.system.settings.rollsettings['attacks'].ability;
                    }
                    else if (this.object.rollType === 'working') {
                        this.object.attribute = this.actor.system.settings.rollsettings['sorcery'].attribute;
                        this.object.ability = this.actor.system.settings.rollsettings['sorcery'].ability;
                    }
                    else if (this.actor.system.settings.rollsettings[this.object.rollType.toLowerCase()]) {
                        this.object.attribute = this.actor.system.settings.rollsettings[this.object.rollType.toLowerCase()].attribute;
                        this.object.ability = this.actor.system.settings.rollsettings[this.object.rollType.toLowerCase()].ability;
                    }
                    else {
                        this.object.attribute = data.attribute || this._getHighestAttribute(this.actor.system.attributes);
                        this.object.ability = data.ability || "archery";
                    }
                    if (this.object.rollType === 'ability' && this.object.ability === 'craft') {
                        this.object.diceModifier += this.actor.system.settings.rollsettings['craft'].bonus;
                    }
                    this.object.customabilities = this.actor.customabilities;
                    if (this.object.customabilities.some(ma => ma._id === this.object.ability && ma.system.abilitytype === 'martialarts')) {
                        this.object.attribute = this.actor.system.abilities['martialarts'].prefattribute;
                    }
                    if (this.object.customabilities.some(craft => craft._id === this.object.ability && craft.system.abilitytype === 'craft')) {
                        this.object.attribute = this.actor.system.abilities['craft'].prefattribute;
                    }
                    this.object.appearance = this.actor.system.attributes.appearance.value;
                }
                if (this._isAttackRoll()) {
                    this.object.diceModifier += this.actor.system.settings.rollsettings['attacks'].bonus;
                    if (this.actor.system.settings.attackrollsettings[this.object.attackType]) {
                        this.object.diceModifier += this.actor.system.settings.attackrollsettings[this.object.attackType].bonus;
                        this.object.damage.damageDice += this.actor.system.settings.attackrollsettings[this.object.attackType].damage;
                        this.object.overwhelming += (this.actor.system.settings.attackrollsettings[this.object.attackType]?.overwhelming || 0);
                    }
                }
                else if (this.actor.system.settings.rollsettings[this.object.rollType.toLowerCase()]) {
                    this.object.diceModifier += this.actor.system.settings.rollsettings[this.object.rollType.toLowerCase()].bonus;
                }

                if (this.actor.system.settings.rollStunts) {
                    this.object.stunt = "one";
                }

                if (this.actor.type === "npc") {
                    this.object.actions = this.actor.actions;
                    this.object.pool = data.pool || "command";
                    this.object.appearance = this.actor.system.appearance.value;
                }
                if (data.weapon) {
                    this.object.weaponTags = data.weapon.traits?.weapontags?.selected || {};
                    this.object.damage.resetInit = data.weapon.resetinitiative;
                    this.object.poison = data.weapon.poison;
                    this.object.targetStat = data.weapon.targetstat;
                    if (this.actor.type === 'character') {
                        this.object.attribute = data.weapon.attribute || this._getHighestAttribute(this.actor.system.attributes);
                        this.object.ability = data.weapon.ability || "archery";
                    }
                    if (this.object.attackType === 'withering' || this.actor.type === "npc" || (data.weapon.ability === 'none' && data.weapon.attribute === 'none')) {
                        this.object.diceModifier += data.weapon.witheringaccuracy || 0;
                        this.object.baseAccuracy = data.weapon.witheringaccuracy || 0;
                        this.object.weaponAccuracy = data.weapon.witheringaccuracy || 0;
                        if (this.object.attackType === 'withering') {
                            this.object.damage.damageDice += data.weapon.witheringdamage || 0;
                            if (this.actor.type === 'character') {
                                if (this.object.weaponTags["flame"] || this.object.weaponTags["crossbow"]) {
                                    this.object.damage.damageDice += 4;
                                }
                                else {
                                    this.object.damage.damageDice += (this.actor.system.attributes[data.weapon.damageattribute]?.value || 0);
                                }
                            }
                        }
                    }
                    if (!this.object.showWithering && data.weapon.decisivedamagetype === 'static') {
                        this.object.damage.damageDice += data.weapon.staticdamage;
                        this.object.damage.decisiveDamageType = 'static';
                    }
                    if (this.object.weaponTags["bashing"] && !this.object.weaponTags["lethal"]) {
                        this.object.damage.type = 'bashing';
                    }
                    if (this.object.weaponTags['aggravated']) {
                        this.object.damage.type = 'aggravated';
                    }
                    if (this.object.weaponTags["improvised"]) {
                        this.object.cost.initiative += 1;
                    }
                    this.object.overwhelming += (data.weapon.overwhelming || 0);
                    this.object.weaponType = data.weapon.weapontype || "melee";
                    this.object.range = this.object.weaponType === 'melee' ? 'close' : 'short';
                    this.object.attackEffectPreset = data.weapon.attackeffectpreset || "none";
                    this.object.attackEffect = data.weapon.attackeffect || "";
                    this.object.weaponMacro = data.weapon.attackmacro || "";
                }
                this.object.difficultyString = 'Ex3.Difficulty';
                if (this.object.rollType === 'readIntentions') {
                    this.object.difficultyString = 'Ex3.Guile';
                }
                if (this.object.rollType === 'social') {
                    this.object.difficultyString = 'Ex3.Resolve';
                }

                if (data.initiativeCost) {
                    this.object.cost.initiative += data.initiativeCost;
                }
                if (this.object.rollType === 'craft') {
                    this.object.intervals = 1;
                    this.object.finished = false;
                    this.object.objectivesCompleted = 0;
                    this._getCraftDifficulty();
                }
                this.object.finesse = 1;
                this.object.ambition = 5;

                if (this.object.rollType === 'working') {
                    this.object.intervals = 5;
                    this.object.goalNumber = 5;
                    this.object.difficulty = 1;
                }
                if (this.object.rollType === 'prophecy') {
                    this.object.intervals = 5 + data.bonusIntervals;
                    this.object.goalNumber = data.prophecyAmbition * 5;
                    this.object.difficulty = 3;
                }
                if (this.object.rollType === 'rout') {
                    this.object.difficulty = 1;
                    if (parseInt(this.actor.system.drill.value) === 0) {
                        this.object.difficulty = 2;
                    }
                }
                if (this.object.rollType === 'command') {
                    this.object.difficulty = 1;
                }
                if (this.object.rollType === 'simpleCraft') {
                    this.object.difficulty = data.difficulty || 1;
                }
                this.object.opposeCaps = {
                    parry: this.actor.system.parry,
                    evasion: this.actor.system.evasion,
                    soak: this.actor.system.soak.cap,
                    guile: this.actor.system.parry.cap,
                    resolve: this.actor.system.resolve.cap,
                }
            }
        }
        this.object.addingCharms = false;
        this.object.showSpecialAttacks = false;
        this.object.missedAttacks = 0;
        this.object.deleteEffects = [];
        this.object.useShieldInitiative = game.settings.get("exaltedthird", "useShieldInitiative");
        this.object.bankableStunts = game.settings.get("exaltedthird", "bankableStunts");
        this.object.simplifiedCrafting = game.settings.get("exaltedthird", "simplifiedCrafting");
        this.object.useEssenceGambit = game.settings.get("exaltedthird", "useEssenceGambits");
        this.object.attributes = CONFIG.exaltedthird.attributes;
        this.object.abilities = CONFIG.exaltedthird.abilities;
        this.object.npcPools = CONFIG.exaltedthird.npcpools;
        this._migrateNewData(data);
        if (this.object.rollType !== 'base') {
            this.object.showTargets = 0;
            if (this.actor.customabilities) {
                this.object.customAbilities = this.actor.customabilities;
            }
            if (this.object.craftId) {
                this.object.ability = this.object.craftId;
            }
            if (this.object.martialArtId) {
                this.object.ability = this.object.martialArtId;
            }
            if (this.object.actionId) {
                this.object.pool = this.object.actionId;
            }
            if (this.object.accuracy) {
                this.object.diceModifier += this.object.accuracy;
                this.object.accuracy = 0;
            }
            this.object.opposingCharms = [];
            if (this.actor.system.battlegroup) {
                this._setBattlegroupBonuses();
            }
            if (this.object.charmList === undefined) {
                this.object.charmList = this.object.rollType === 'useOpposingCharms' ? this.actor.defensecharms : this.actor.rollcharms;
                for (var [ability, charmlist] of Object.entries(this.object.charmList)) {
                    charmlist.collapse = (ability !== this.object.ability && ability !== this.object.attribute);
                    for (const charm of charmlist.list) {
                        this.getEnritchedHTML(charm);
                    }
                }
            }
            this._updateSpecialtyList();
            if (this.actor.system.dicemodifier.value) {
                this.object.diceModifier += this.actor.system.dicemodifier.value;
            }
            let combat = game.combat;
            if (combat) {
                let combatant = this._getActorCombatant();
                if (combatant && combatant.initiative !== null) {
                    if (!this.object.showWithering) {
                        if (data.weapon && this.object.damage.decisiveDamageType === 'initiative') {
                            this.object.damage.damageDice += combatant.initiative;
                        }
                    }
                    this.object.characterInitiative = combatant.initiative;
                    this.object.originalInitiative = combatant.initiative;
                }
            }
            this.object.targets = {}
            if (this.actor.token) {
                this.object.conditions = (this.actor.token && this.actor.token.actor.effects) ? this.actor.token.actor.effects : [];
            }
            else {
                this.object.conditions = this.actor.effects;
            }
            if (game.user.targets && game.user.targets.size > 0) {
                this.object.showTargets = game.user.targets.size;
                if (this._isAttackRoll() || this.object.rollType === 'social' || this.object.rollType === 'readIntentions') {
                    this._setUpMultitargets();
                }
                else {
                    this._setupSingleTarget(Array.from(game.user.targets)[0]);
                }
            }
            if (this.object.conditions.some(e => e.name === 'blind')) {
                this.object.diceModifier -= 3;
            }
            if (this._isAttackRoll()) {
                if (this.object.conditions.some(e => e.statuses.has('prone'))) {
                    this.object.diceModifier -= 3;
                }
                if (this.object.conditions.some(e => e.statuses.has('grappled'))) {
                    this.object.diceModifier -= 1;
                }
            }
            this.object.motePool = this.actor.system?.settings?.charmmotepool || 'peripheral';
            this.object.spells = this.actor.items.filter(item => item.type === 'spell' && item.system.cost);
            if (data.rollType === 'sorcery') {
                const activeSpell = this.object.spells.find(spell => spell.system.shaping);
                if (data.spell) {
                    const fullSpell = this.actor.items.get(data.spell);
                    if (!activeSpell || activeSpell.id !== data.spell) {
                        this.object.cost.willpower += parseInt(fullSpell.system.willpower);
                    }
                    this.object.spell = data.spell;
                }
                else {
                    if (activeSpell) {
                        this.object.spell = activeSpell.id;
                    }
                }
            }

            for (var [ability, charmlist] of Object.entries(this.object.charmList)) {
                for (const charm of charmlist.list.filter(charm => charm.system.active && this._autoAddCharm(charm))) {
                    this.addCharm(charm, false);
                }
            }

            this._calculateAnimaGain();
        }
    }

    /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
    get template() {
        var template = "systems/exaltedthird/templates/dialogues/ability-roll.html";
        if (this.object.rollType === 'useOpposingCharms') {
            template = "systems/exaltedthird/templates/dialogues/use-opposing-charms.html";
        }
        if (this.object.rollType === 'base') {
            template = "systems/exaltedthird/templates/dialogues/dice-roll.html";
        }
        else if (this._isAttackRoll()) {
            template = "systems/exaltedthird/templates/dialogues/attack-roll.html";
        }
        return template;
    }

    _setUpMultitargets() {
        this.object.hasDifficulty = false;
        var userAppearance = this.actor.type === 'npc' ? this.actor.system.appearance.value : this.actor.system.attributes[this.actor.system.settings.rollsettings.social.appearanceattribute].value;
        for (const target of Array.from(game.user.targets)) {
            target.rollData = {
                resolve: 0,
                guile: 0,
                targetIntimacies: [],
                supportedIntimacy: '0',
                opposedIntimacy: '0',
                appearanceBonus: 0,
                armoredSoak: 0,
                naturalSoak: 0,
                defenseType: game.i18n.localize('Ex3.None'),
                defense: 0,
                hardness: 0,
                soak: 0,
                shieldInitiative: 0,
                diceModifier: 0,
                successModifier: 0,
                damageModifier: 0,
            }
            target.rollData.guile = target.actor.system.guile.value;
            target.rollData.resolve = target.actor.system.resolve.value;
            target.rollData.appearanceBonus = Math.max(0, userAppearance - target.actor.system.resolve.value);
            target.rollData.targetIntimacies = target.actor.intimacies.filter((i) => i.system.visible || game.user.isGM);
            target.rollData.attackSuccesses = 0;
            if (target.actor.system.warstrider.equipped) {
                target.rollData.soak = target.actor.system.warstrider.soak.value;
                target.rollData.hardness = target.actor.system.warstrider.hardness.value;
            }
            else {
                target.rollData.soak = target.actor.system.soak.value;
                target.rollData.armoredSoak = target.actor.system.armoredsoak.value;
                target.rollData.naturalSoak = target.actor.system.naturalsoak.value;
                target.rollData.hardness = target.actor.system.hardness.value;
            }
            target.rollData.shieldInitiative = target.actor.system.shieldinitiative.value;
            const tokenId = target.actor?.token?.id || target.actor.getActiveTokens()[0].id;
            let combatant = game.combat?.combatants?.find(c => c.tokenId === tokenId) || null;
            if (combatant && combatant.initiative && combatant.initiative <= 0) {
                target.rollData.hardness = 0;
            }
            if (target.actor.system.battlegroup) {
                target.rollData.defense += parseInt(target.actor.system.drill.value);
                if (target.actor.system.might.value > 1) {
                    target.rollData.defense += (target.actor.system.might.value - 1);
                }
                else {
                    target.rollData.defense += target.actor.system.might.value;
                }
                target.rollData.soak += target.actor.system.size.value;
                target.rollData.naturalSoak += target.actor.system.size.value;
            }
            let effectiveParry = target.actor.system.parry.value;
            let effectiveEvasion = target.actor.system.evasion.value;
            let effectiveResolve = target.actor.system.resolve.value;
            let effectiveGuile = target.actor.system.guile.value;

            if (target.actor.effects) {
                if (target.actor.effects.some(e => e.statuses.has('lightcover'))) {
                    effectiveParry += 1;
                    effectiveEvasion += 1;
                }
                if (target.actor.effects.some(e => e.statuses.has('heavycover'))) {
                    effectiveParry += 2;
                    effectiveEvasion += 2;
                }
                if (target.actor.effects.some(e => e.statuses.has('fullcover'))) {
                    effectiveParry += 3;
                    effectiveEvasion += 3;
                }
                if (target.actor.effects.some(e => e.statuses.has('fulldefense')) && !this.object.weaponTags['flexible']) {
                    effectiveParry += 2;
                    effectiveEvasion += 2;
                }
                if (target.actor.effects.some(e => e.statuses.has('surprised'))) {
                    effectiveParry -= 2;
                    effectiveEvasion -= 2;
                }
                if (target.actor.effects.some(e => e.statuses.has('grappled')) || target.actor.effects.some(e => e.statuses.has('grappling'))) {
                    effectiveParry -= 2;
                    effectiveEvasion -= 2;
                }
                if (target.actor.effects.some(e => e.statuses.has('prone'))) {
                    effectiveParry -= 1;
                }
                effectiveParry += Math.min(target.actor.system.negateparrypenalty.value, target.actor.getRollData().currentParryPenalty);
                if (target.actor.effects.some(e => e.statuses.has('prone'))) {
                    effectiveEvasion -= 2;
                }
                if (target.actor.effects.some(e => e.statuses.has('mounted'))) {
                    if (!this.object.conditions.some(e => e.statuses.has('mounted')) && this.object.range === 'close') {
                        const combinedTags = this.actor.items.filter(item => item.type === 'weapon' && item.system.equipped === true).reduce((acc, weapon) => {
                            const tags = weapon.system.traits.weapontags.value || [];
                            return acc.concat(tags);
                        }, []);
                        if (!combinedTags.includes('reaching')) {
                            effectiveEvasion += 1;
                            effectiveParry += 1;
                        }
                    }
                }
                effectiveEvasion += Math.min(target.actor.system.negateevasionpenalty.value, target.actor.getRollData().currentEvasionPenalty);
            }
            if (target.actor.system.sizecategory === 'tiny') {
                if (this.actor.system.sizecategory !== 'tiny' && this.actor.system.sizecategory !== 'minuscule') {
                    effectiveEvasion += 2;
                }
            }
            if (target.actor.system.sizecategory === 'minuscule') {
                if (this.actor.system.sizecategory !== 'minuscule') {
                    effectiveEvasion += 3;
                }
            }
            if (target.actor.system.settings.defenseStunts) {
                effectiveEvasion += 1;
                effectiveParry += 1;
                effectiveResolve += 1;
                effectiveGuile += 1;
            }
            if (target.actor.system.health.penalty !== 'inc') {
                effectiveEvasion -= Math.max(0, target.actor.system.health.penalty - target.actor.system.health.penaltymod);
                effectiveParry -= Math.max(0, target.actor.system.health.penalty - target.actor.system.health.penaltymod);
            }
            if (this.object.targetStat === 'resolve') {
                target.rollData.defenseType = game.i18n.localize('Ex3.Resolve');
                target.rollData.defense = effectiveResolve;
            }
            else if (this.object.targetStat === 'guile') {
                target.rollData.defenseType = game.i18n.localize('Ex3.Guile');
                target.rollData.defense = effectiveGuile;
            }
            else {
                if ((effectiveParry >= effectiveEvasion || this.object.weaponTags["undodgeable"]) && !this.object.weaponTags["unblockable"]) {
                    target.rollData.defenseType = game.i18n.localize('Ex3.Parry');
                    target.rollData.defense = effectiveParry;
                }
                if ((effectiveEvasion >= effectiveParry || this.object.weaponTags["unblockable"]) && !this.object.weaponTags["undodgeable"]) {
                    target.rollData.defenseType = game.i18n.localize('Ex3.Evasion');
                    target.rollData.defense = effectiveEvasion;
                }
            }
            if (target.rollData.defense < 0) {
                target.rollData.defense = 0;
            }
            if (target.rollData.soak < 0) {
                target.rollData.soak = 0;
            }

            if (this.object.weaponTags["bombard"]) {
                if (!target.actor.system.battlegroup && target.actor.system.sizecategory !== 'legendary' && !target.actor.system.warstrider.equipped) {
                    target.rollData.diceModifier -= 4;
                }
            }
            if (this.object.attackType === 'withering' && this.object.conditions?.some(e => e.statuses.has('mounted'))) {
                if (!target.actor.effects.some(e => e.statuses.has('mounted')) && this.object.range === 'close') {
                    const combinedTags = target.actor.items.filter(item => item.type === 'weapon' && item.system.equipped === true).reduce((acc, weapon) => {
                        const tags = weapon.system.traits.weapontags.value || [];
                        return acc.concat(tags);
                    }, []);
                    if (!combinedTags.includes('reaching')) {
                        target.rollData.diceModifier += 1;
                        if (target.actor.system.battlegroup) {
                            target.rollData.diceModifier += 1;
                        }
                    }
                }
            }
            this.object.targets[target.id] = target;
        }
    }

    _setupSingleTarget(target) {
        if (target) {
            this.object.target = target;
            this.object.newTargetData = duplicate(target.actor);
            this.object.updateTargetActorData = false;
            this.object.updateTargetInitiative = false;
            if (this.object.rollType === 'command') {
                if (target.actor.system.battlegroup) {
                    if (target.actor.system.drill.value === '0') {
                        this.object.diceModifier -= 2;
                    }
                    if (target.actor.system.drill.value === '2') {
                        this.object.diceModifier += 2;
                    }
                }
            }
        }
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        // Token Configuration
        if (this.object.rollType !== 'base') {
            if (this.object.rollType !== 'useOpposingCharms') {
                const settingsButton = {
                    label: game.i18n.localize('Ex3.Settings'),
                    class: 'roller-settings',
                    id: "roller-settings",
                    icon: 'fas fa-cog',
                    onclick: async (ev) => {
                        let confirmed = false;
                        const html = await renderTemplate("systems/exaltedthird/templates/dialogues/dice-roller-settings.html", { 'isAttack': this._isAttackRoll(), 'selfDefensePenalty': this.object.triggerSelfDefensePenalty, 'targetDefensePenalty': this.object.triggerTargetDefensePenalty, 'settings': this.object.settings, 'rerolls': this.object.reroll, 'damageRerolls': this.object.damage.reroll });
                        new Dialog({
                            title: `Dice Roll Settings`,
                            content: html,
                            buttons: {
                                roll: { label: "Save", callback: () => confirmed = true },
                            },
                            close: html => {
                                if (confirmed) {
                                    this.object.settings.doubleSucccessCaps.sevens = parseInt(html.find('#sevensCap').val() || 0);
                                    this.object.settings.doubleSucccessCaps.eights = parseInt(html.find('#eightsCap').val() || 0);
                                    this.object.settings.doubleSucccessCaps.nines = parseInt(html.find('#ninesCap').val() || 0);
                                    this.object.settings.doubleSucccessCaps.tens = parseInt(html.find('#tensCap').val() || 0);
                                    this.object.settings.excludeOnesFromRerolls = html.find('#excludeOnesFromRerolls').is(":checked");
                                    this.object.settings.triggerOnOnes = html.find('#triggerOnOnes').val() || 'none';
                                    this.object.settings.triggerOnTens = html.find('#triggerOnTens').val() || 'none';

                                    this.object.settings.alsoTriggerTwos = html.find('#alsoTriggerTwos').is(":checked");
                                    this.object.settings.alsoTriggerNines = html.find('#alsoTriggerNines').is(":checked");

                                    this.object.settings.triggerTensCap = parseInt(html.find('#triggerTensCap').val() || 0);
                                    this.object.settings.triggerOnesCap = parseInt(html.find('#triggerOnesCap').val() || 0);

                                    this.object.triggerSelfDefensePenalty = parseInt(html.find('#selfDefensePenalty').val() || 0);
                                    this.object.triggerTargetDefensePenalty = parseInt(html.find('#targetDefensePenalty').val() || 0);

                                    this.object.settings.ignoreLegendarySize = html.find('#ignoreLegendarySize').is(":checked");
                                    this.object.settings.damage.doubleSucccessCaps.sevens = parseInt(html.find('#damageSevensCap').val() || 0);
                                    this.object.settings.damage.doubleSucccessCaps.eights = parseInt(html.find('#damageEightsCap').val() || 0);
                                    this.object.settings.damage.doubleSucccessCaps.nines = parseInt(html.find('#damageNinesCap').val() || 0);
                                    this.object.settings.damage.doubleSucccessCaps.tens = parseInt(html.find('#damageTensCap').val() || 0);
                                    this.object.settings.damage.excludeOnesFromRerolls = html.find('#damageExcludeOnesFromRerolls').is(":checked");
                                    this.object.settings.damage.triggerTensCap = parseInt(html.find('#damageTriggerTensCap').val() || 0);
                                    this.object.settings.damage.alsoTriggerNines = html.find('#damageAlsoTriggerNines').is(":checked");

                                    for (let [rerollKey, rerollValue] of Object.entries(this.object.reroll)) {
                                        this.object.reroll[rerollKey].cap = parseInt(html.find(`#reroll-${this.object.reroll[rerollKey].number}-cap`).val() || 0);
                                    }

                                    for (let [rerollKey, rerollValue] of Object.entries(this.object.damage.reroll)) {
                                        this.object.damage.reroll[rerollKey].cap = parseInt(html.find(`#damage-reroll-${this.object.damage.reroll[rerollKey].number}-cap`).val() || 0);
                                    }
                                }
                            }
                        }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
                    },
                };
                buttons = [settingsButton, ...buttons];
            }

            const charmsButton = {
                label: game.i18n.localize('Ex3.AddCharm'),
                class: 'add-charm',
                id: "add-charm",
                icon: 'fas fa-bolt',
                onclick: (ev) => {
                    // this.object.charmList = this.actor.rollcharms;
                    for (var [ability, charmlist] of Object.entries(this.object.charmList)) {
                        if (charmlist.collapse === undefined) {
                            charmlist.collapse = (ability !== this.object.ability && ability !== this.object.attribute);
                        }
                        for (const charm of charmlist.list) {
                            if (charm.system.ability === this.object.ability || charm.system.ability === this.object.attribute) {
                                charmlist.collapse = false;
                            }
                            if (this.object.addedCharms.some((addedCharm) => addedCharm.id === charm._id)) {
                                charmlist.collapse = false;
                                var addedCharm = this.object.addedCharms.find((addedCharm) => addedCharm.id === charm._id);
                                charm.charmAdded = true;
                                charm.timesAdded = addedCharm.timesAdded || 1;
                            }
                            else {
                                charm.charmAdded = false;
                                charm.timesAdded = 0;
                            }
                            this.getEnritchedHTML(charm);
                        }
                    }
                    if (this.object.addingCharms) {
                        ev.currentTarget.innerHTML = `<i class="fas fa-bolt"></i> ${game.i18n.localize('Ex3.AddCharm')}`;
                    }
                    else {
                        ev.currentTarget.innerHTML = `<i class="fas fa-bolt"></i> ${game.i18n.localize('Ex3.Done')}`;
                    }
                    if (this._isAttackRoll()) {
                        this.object.showSpecialAttacks = true;
                        if (this.object.rollType !== 'gambit') {
                            for (var specialAttack of this.object.specialAttacksList) {
                                if ((specialAttack.id === 'knockback' || specialAttack.id === 'knockdown') && this.object.weaponTags['smashing']) {
                                    specialAttack.show = true;
                                }
                                else if (specialAttack.id === 'impale' && this.object.weaponTags['lance']) {
                                    specialAttack.show = true;
                                }
                                else if (this.object.weaponTags[specialAttack.id] || specialAttack.id === 'flurry') {
                                    specialAttack.show = true;
                                }
                                else if (specialAttack.id === 'aim' || specialAttack.id === 'fulldefense') {
                                    specialAttack.show = true;
                                }
                                else {
                                    specialAttack.added = false;
                                    specialAttack.show = false;
                                }
                            }
                        }
                    }
                    this.object.addingCharms = !this.object.addingCharms;
                    this.render();
                },
            };
            buttons = [charmsButton, ...buttons];
            const rollButton = {
                label: this.object.id ? game.i18n.localize('Ex3.Update') : game.i18n.localize('Ex3.Save'),
                class: 'roll-dice',
                icon: 'fas fa-dice-d6',
                onclick: (ev) => {
                    this._saveRoll(this.object);
                },
            };
            buttons = [rollButton, ...buttons];
        }

        return buttons;
    }

    async getEnritchedHTML(charm) {
        charm.enritchedHTML = await TextEditor.enrichHTML(charm.system.description, { async: true, secrets: this.actor.isOwner, relativeTo: charm });
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`],
            popOut: true,
            template: "systems/exaltedthird/templates/dialogues/dice-roll.html",
            id: "roll-form",
            title: game.i18n.localize('Ex3.Dialog'),
            width: 400,
            resizable: true,
            submitOnChange: true,
            closeOnSubmit: false
        });
    }


    resolve = function (value) { return value };

    get resolve() {
        return this.resolve
    }

    set resolve(value) {
        this.resolve = value;
    }

    /**
     * Renders out the Roll form.
     * @returns {Promise} Returns True or False once the Roll or Cancel buttons are pressed.
     */
    async roll() {
        if (this.object.skipDialog) {
            if (this.object.rollType === 'useOpposingCharms') {
                await this.useOpposingCharms();
            } else {
                await this._roll();
            }
            return true;
        } else {
            var _promiseResolve;
            this.promise = new Promise(function (promiseResolve) {
                _promiseResolve = promiseResolve
            });
            this.resolve = _promiseResolve;
            this.render(true);
            return this.promise;
        }
    }

    async _saveRoll(rollData) {
        let html = await renderTemplate("systems/exaltedthird/templates/dialogues/save-roll.html", { 'name': this.object.name || 'New Roll' });
        new Dialog({
            title: "Save Roll",
            content: html,
            default: 'save',
            buttons: {
                save: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Save',
                    default: true,
                    callback: html => {
                        let results = document.getElementById('name').value;
                        let uniqueId = this.object.id || randomID(16);
                        rollData.name = results;
                        rollData.id = uniqueId;
                        rollData.target = null;
                        rollData.target = null;
                        rollData.showTargets = false;
                        rollData.targets = null;
                        const addedCharmsConvertArray = [];
                        for (let i = 0; i < this.object.addedCharms.length; i++) {
                            addedCharmsConvertArray.push(duplicate(this.object.addedCharms[i]));
                            addedCharmsConvertArray[i].timesAdded = this.object.addedCharms[i].timesAdded;
                        }
                        this.object.addedCharms = addedCharmsConvertArray;

                        let updates = {
                            "data.savedRolls": {
                                [uniqueId]: rollData
                            }
                        };
                        this.actor.update(updates);
                        this.saved = true;
                        ui.notifications.notify(`Saved Roll`);
                        return;
                    },
                }
            }
        }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
    }

    getData() {
        return {
            actor: this.actor,
            data: this.object,
        };
    }

    async _updateObject(event, formData) {
        mergeObject(this, formData);
    }

    _autoAddCharm(charm) {
        if(!charm.system.autoaddtorolls) {
            return false;
        }
        switch (charm.system.autoaddtorolls) {
            case 'action':
                return (this.object.rollType !== 'useOpposingCharms');
            case 'attacks':
                return this._isAttackRoll();
            case 'opposedRolls':
                return (this.object.rollType === 'useOpposingCharms');
            case 'sameAbility':
                return (charm.system.ability === this.object.ability || charm.system.ability === this.object.attribute);
        }
        if(this.object.rollType === charm.system.autoaddtorolls) {
            return true;
        }
        return false;
    }

    async addCharm(item, addCosts = true) {
        var existingAddedCharm = this.object.addedCharms.find((addedCharm) => addedCharm.id === item._id);
        if (existingAddedCharm) {
            existingAddedCharm.timesAdded++;
        }
        else {
            item.timesAdded = 1;
            item.saveId = item.id;
            this.object.addedCharms.push(item);
        }
        for (var charmlist of Object.values(this.object.charmList)) {
            for (const charm of charmlist.list.filter(charm => charm.system.diceroller.enabled)) {
                var existingAddedCharm = this.object.addedCharms.find((addedCharm) => addedCharm.id === charm._id);
                if (existingAddedCharm) {
                    charm.charmAdded = true;
                    charm.timesAdded = existingAddedCharm.timesAdded;
                }
            }
        }
        if(addCosts) {
            if (item.system.keywords.toLowerCase().includes('mute')) {
                this.object.cost.muteMotes += item.system.cost.motes;
            }
            else {
                this.object.cost.motes += item.system.cost.motes;
            }
            this.object.cost.anima += item.system.cost.anima;
            this.object.cost.penumbra += item.system.cost.penumbra;
            this.object.cost.willpower += item.system.cost.willpower;
            this.object.cost.silverxp += item.system.cost.silverxp;
            this.object.cost.goldxp += item.system.cost.goldxp;
            this.object.cost.whitexp += item.system.cost.whitexp;
            this.object.cost.initiative += item.system.cost.initiative;
            this.object.cost.grappleControl += item.system.cost.grapplecontrol;
    
    
            if (item.system.cost.aura) {
                this.object.cost.aura = item.system.cost.aura;
            }
            if (item.system.cost.health > 0) {
                if (item.system.cost.healthtype === 'bashing') {
                    this.object.cost.healthbashing += item.system.cost.health;
                }
                else if (item.system.cost.healthtype === 'lethal') {
                    this.object.cost.healthlethal += item.system.cost.health;
                }
                else {
                    this.object.cost.healthaggravated += item.system.cost.health;
                }
            }
        }

        this.object.restore.motes += item.system.restore.motes;
        this.object.restore.willpower += item.system.restore.willpower;
        this.object.restore.health += item.system.restore.health;
        this.object.restore.initiative += item.system.restore.initiative;

        this.object.diceModifier += this._getFormulaValue(item.system.diceroller.bonusdice);
        this.object.successModifier += this._getFormulaValue(item.system.diceroller.bonussuccesses);
        this.object.triggerSelfDefensePenalty += item.system.diceroller.selfdefensepenalty;
        this.object.triggerTargetDefensePenalty += item.system.diceroller.targetdefensepenalty;
        if (!item.system.diceroller.settings.noncharmdice) {
            this.object.charmDiceAdded += this._getFormulaValue(item.system.diceroller.bonusdice);
        }
        if (!item.system.diceroller.settings.noncharmsuccesses) {
            this.object.charmDiceAdded += (this._getFormulaValue(item.system.diceroller.bonussuccesses) * 2);
        }
        if (item.system.diceroller.doublesuccess < this.object.doubleSuccess) {
            this.object.doubleSuccess = item.system.diceroller.doublesuccess;
        }
        this.object.targetNumber -= item.system.diceroller.decreasetargetnumber;
        for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.reroll)) {
            if (rerollValue) {
                this.object.reroll[rerollKey].status = true;
            }
        }
        if (item.system.diceroller.rerollfailed) {
            this.object.rerollFailed = item.system.diceroller.rerollfailed;
        }
        if (item.system.diceroller.rolltwice) {
            this.object.rollTwice = item.system.diceroller.rolltwice;
        }
        this.object.rerollNumber += this._getFormulaValue(item.system.diceroller.rerolldice);
        this.object.diceToSuccesses += this._getFormulaValue(item.system.diceroller.diceToSuccesses);

        if (this.object.showTargets) {
            const targetValues = Object.values(this.object.targets);
            for (const target of targetValues) {
                target.rollData.defense = Math.max(0, target.rollData.defense - this._getFormulaValue(item.system.diceroller.reducedifficulty));
                target.rollData.resolve = Math.max(0, target.rollData.resolve - this._getFormulaValue(item.system.diceroller.reducedifficulty));
                target.rollData.guile = Math.max(0, target.rollData.guile - this._getFormulaValue(item.system.diceroller.reducedifficulty));
                if (this.object.rollType === 'damage') {
                    target.rollData.attackSuccesses += this._getFormulaValue(item.system.diceroller.bonussuccesses);
                }
            }
        }
        else {
            this.object.difficulty = Math.max(0, this.object.difficulty - this._getFormulaValue(item.system.diceroller.reducedifficulty));
            this.object.defense = Math.max(0, this.object.defense - this._getFormulaValue(item.system.diceroller.reducedifficulty));
            if (this.object.rollType === 'damage') {
                this.object.attackSuccesses += this._getFormulaValue(item.system.diceroller.bonussuccesses);
            }
        }

        for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.rerollcap)) {
            if (rerollValue) {
                this.object.reroll[rerollKey].cap += this._getFormulaValue(rerollValue);
            }
        }
        for (let [key, value] of Object.entries(item.system.diceroller.doublesucccesscaps)) {
            if (value) {
                this.object.settings.doubleSucccessCaps[key] += this._getFormulaValue(value);
            }
        }
        if (item.system.diceroller.ignorelegendarysize) {
            this.object.settings.ignoreLegendarySize = item.system.diceroller.ignorelegendarysize;
        }
        if (item.system.diceroller.excludeonesfromrerolls) {
            this.object.settings.excludeOnesFromRerolls = item.system.diceroller.excludeonesfromrerolls;
        }

        this.object.damage.damageDice += this._getFormulaValue(item.system.diceroller.damage.bonusdice);
        this.object.damage.damageSuccessModifier += this._getFormulaValue(item.system.diceroller.damage.bonussuccesses);
        if (item.system.diceroller.damage.doublesuccess < this.object.damage.doubleSuccess) {
            this.object.damage.doubleSuccess = item.system.diceroller.damage.doublesuccess;
        }
        this.object.damage.targetNumber -= item.system.diceroller.damage.decreasetargetnumber;
        this.object.overwhelming += this._getFormulaValue(item.system.diceroller.damage.overwhelming);
        this.object.damage.postSoakDamage += this._getFormulaValue(item.system.diceroller.damage.postsoakdamage);
        this.object.damage.diceToSuccesses += this._getFormulaValue(item.system.diceroller.damage.dicetosuccesses);
        for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.damage.reroll)) {
            if (rerollValue) {
                this.object.damage.reroll[rerollKey].status = true;
            }
        }
        if (item.system.diceroller.damage.rerollfailed) {
            this.object.damage.rerollFailed = item.system.diceroller.damage.rerollfailed;
        }
        if (item.system.diceroller.damage.rolltwice) {
            this.object.damage.rollTwice = item.system.diceroller.damage.rolltwice;
        }
        this.object.damage.rerollNumber += this._getFormulaValue(item.system.diceroller.damage.rerolldice);
        if (item.system.diceroller.damage.threshholdtodamage) {
            this.object.damage.threshholdToDamage = item.system.diceroller.damage.threshholdtodamage;
        }
        if (item.system.diceroller.damage.doublerolleddamage) {
            this.object.damage.doubleRolledDamage = item.system.diceroller.damage.doublerolleddamage;
        }
        if (item.system.diceroller.damage.doublerolleddamage) {
            this.object.damage.doubleRolledDamage = item.system.diceroller.damage.doublerolleddamage;
        }
        this.object.damage.ignoreSoak += this._getFormulaValue(item.system.diceroller.damage.ignoresoak);
        this.object.damage.ignoreHardness += this._getFormulaValue(item.system.diceroller.damage.ignorehardness);

        for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.damage.rerollcap)) {
            if (rerollValue) {
                this.object.damage.reroll[rerollKey].cap += this._getFormulaValue(rerollValue);
            }
        }
        for (let [key, value] of Object.entries(item.system.diceroller.damage.doublesucccesscaps)) {
            if (value) {
                this.object.settings.damage.doubleSucccessCaps[key] += this._getFormulaValue(value);
            }
        }
        if (item.system.diceroller.damage.excludeonesfromrerolls) {
            this.object.settings.damage.excludeOnesFromRerolls = item.system.diceroller.damage.excludeonesfromrerolls;
        }

        if (item.system.diceroller.activateAura !== 'none') {
            this.object.activateAura = item.system.diceroller.activateAura;
        }
        if (item.system.diceroller.triggerontens !== 'none') {
            this.object.settings.triggerOnTens = item.system.diceroller.triggerontens;
            this.object.settings.alsoTriggerNines = item.system.diceroller.alsotriggernines;
        }
        this.object.settings.triggerTensCap += this._getFormulaValue(item.system.diceroller.triggertenscap);

        if (item.system.diceroller.damage.triggerontens !== 'none') {
            this.object.settings.damage.triggerOnTens = item.system.diceroller.damage.triggerontens;
            this.object.settings.damage.alsoTriggerNines = item.system.diceroller.damage.alsotriggernines;
        }
        this.object.settings.damage.triggerTensCap += this._getFormulaValue(item.system.diceroller.damage.triggertenscap);
        if (item.system.diceroller.triggerontens !== 'none') {
            this.object.settings.triggerOnTens = item.system.diceroller.triggerontens;
        }
        this._calculateAnimaGain();
        this.render();
    }

    _getFormulaValue(charmValue, opposedCharmActor = null) {
        var rollerValue = 0;
        if (charmValue) {
            if (charmValue.split(' ').length === 3) {
                var negativeValue = false;
                if (charmValue.includes('-(')) {
                    charmValue = charmValue.replace(/(-\(|\))/g, '');
                    negativeValue = true;
                }
                var split = charmValue.split(' ');
                var leftVar = this._getFormulaActorValue(split[0], opposedCharmActor);
                var operand = split[1];
                var rightVar = this._getFormulaActorValue(split[2], opposedCharmActor);
                switch (operand) {
                    case '+':
                        rollerValue = leftVar + rightVar;
                        break;
                    case '-':
                        rollerValue = Math.max(0, leftVar - rightVar);
                        break;
                    case '/>':
                        if (rightVar) {
                            rollerValue = Math.ceil(leftVar / rightVar);
                        }
                        break;
                    case '/<':
                        if (rightVar) {
                            rollerValue = Math.floor(leftVar / rightVar);
                        }
                        break;
                    case '*':
                        rollerValue = leftVar * rightVar;
                        break;
                    case '|':
                        rollerValue = Math.max(leftVar, rightVar);
                        break;
                    case 'cap':
                        rollerValue = Math.min(leftVar, rightVar);
                        break;
                }
                if (negativeValue) {
                    rollerValue *= -1;
                }
            }
            else {
                rollerValue = this._getFormulaActorValue(charmValue, opposedCharmActor);
            }
        }
        return rollerValue;
    }

    _getBooleanFormulaValue(charmValue, opposedCharmActor = null) {
        if (charmValue) {
            if (charmValue.split(' ').length === 3) {
                var split = charmValue.split(' ');
                var leftVar = this._getFormulaActorValue(split[0], opposedCharmActor);
                var operand = split[1];
                var rightVar = this._getFormulaActorValue(split[2], opposedCharmActor);
                switch (operand) {
                    case "==":
                        return leftVar == rightVar;
                    case "!=":
                        return leftVar != rightVar;
                    case "<=":
                        return leftVar <= rightVar;
                    case ">=":
                        return leftVar >= rightVar;
                    case "<":
                        return leftVar < rightVar;
                    case ">":
                        return leftVar > rightVar;
                    default:
                        console.log("Invalid Operator");
                        return false;
                }
            }
        }
        return false;
    }

    _getRerollFormulaCap(formula, damage = false, opposedCharmActor = null) {
        const rerollFaceMap = {
            '1': 'one',
            '2': 'two',
            '3': 'three',
            '4': 'four',
            '5': 'five',
            '6': 'six',
            '7': 'seven',
            '8': 'eight',
            '9': 'nine',
            '10': 'ten',
        }

        if (formula.includes('cap')) {
            var split = formula.split(' ');
            if (rerollFaceMap[split[0]]) {
                if (damage) {
                    this.object.damage.reroll[rerollFaceMap[split[0]]].status = true;
                    this.object.damage.reroll[rerollFaceMap[split[0]]].cap = this._getFormulaActorValue(split[2], opposedCharmActor);
                } else {
                    this.object.damage.reroll[rerollFaceMap[split[0]]].status = true;
                    this.object.damage.reroll[rerollFaceMap[split[0]]].cap = this._getFormulaActorValue(split[2], opposedCharmActor);
                }
            }
        }
        else {
            if (rerollFaceMap[formula]) {
                if (damage) {
                    this.object.damage.reroll[rerollFaceMap[formula]].status = true;
                } else {
                    this.object.reroll[rerollFaceMap[formula]].status = true;
                }
            }
        }
    }

    _getDoublesFormula(formula, damage = false, opposedCharmActor = null) {
        const doublesChart = {
            '7': 'sevens',
            '8': 'eights',
            '9': 'nines',
            '10': 'tens',
        }
        if (formula.includes('cap')) {
            var split = formula.split(' ');
            if (doublesChart[split[0]]) {
                if (damage) {
                    this.object.damage.doubleSuccess = parseInt(split[0]);
                    this.object.settings.damage.doubleSucccessCaps[doublesChart[split[0]]] = this._getFormulaActorValue(split[2], opposedCharmActor);
                } else {
                    this.object.doubleSuccess = parseInt(split[0]);
                    this.object.settings.doubleSucccessCaps[doublesChart[split[0]]] = this._getFormulaActorValue(split[2], opposedCharmActor);
                }
            }
        }
        else {
            if (doublesChart[formula]) {
                if (damage) {
                    this.object.damage.doubleSuccess = parseInt(formula);
                } else {
                    this.object.doubleSuccess = parseInt(formula);
                }
            }
        }
    }

    _getHealthFormula(formula) {
        let numberValue = formula.replace(/[^0-9]/g, '');
        if (numberValue) {
            if (formula.includes('a')) {
                this.object.cost.healthaggravated += numberValue;
            } else if (formula.includes('b')) {
                this.object.cost.healthbashing += numberValue;
            } else {
                this.object.cost.healthlethal += numberValue;
            }
        }
    }

    _getFormulaActorValue(formula, opposedCharmActor = null) {
        var formulaVal = 0;
        var forumlaActor = this.actor;
        if (opposedCharmActor) {
            forumlaActor = opposedCharmActor;
        }
        if (parseInt(formula)) {
            return parseInt(formula);
        }
        if (formula.includes('target-')) {
            formula = formula.replace('target-', '');
            if (this.object.target?.actor) {
                forumlaActor = this.object.target?.actor;
            }
            else if (Object.values(this.object.targets)[0]) {
                const targetValues = Object.values(this.object.targets);
                forumlaActor = targetValues[0].actor;
            }
            else {
                return 0;
            }
        }
        var negativeValue = false;
        if (formula.includes('-')) {
            formula = formula.replace('-', '');
            negativeValue = true;
        }
        if (forumlaActor.getRollData()[formula]?.value) {
            formulaVal = forumlaActor.getRollData()[formula]?.value;
        }
        if (negativeValue) {
            formulaVal *= -1;
        }
        return formulaVal;
    }

    async addMultiOpposedBonuses(data) {
        for (const charm of data.charmList) {
            charm.actor = data.actor;
            let timesAdded = charm.timesAdded;
            for (let i = 0; i < timesAdded; i++) {
                await this.addOpposedBonus(charm);
            }
        }
        if (this.object.showTargets) {
            const targetValues = Object.values(this.object.targets);
            if (targetValues.length === 1) {
                targetValues[0].rollData.guile += data.guile;
                targetValues[0].rollData.resolve += data.resolve;
                targetValues[0].rollData.defense += data.defense;
                targetValues[0].rollData.soak += data.soak;
                targetValues[0].rollData.hardness += data.hardness;
                targetValues[0].rollData.diceModifier += data.dice;
            }
            else {
                for (const target of targetValues) {
                    if (target.actor.id === data.actor._id || targetValues.length === 1) {
                        target.rollData.guile += data.guile;
                        target.rollData.resolve += data.resolve;
                        target.rollData.defense += data.defense;
                        target.rollData.soak += data.soak;
                        target.rollData.hardness += data.hardness;
                        target.rollData.diceModifier += data.dice;
                    }
                }
            }
        }
        else {
            this.object.defense += data.defense;
            this.object.soak += data.soak;
            this.object.hardness += data.hardness;
            this.object.diceModifier += data.dice;
            if (this.object.rollType === 'readIntentions') {
                this.object.difficulty += data.guile;
            }
            if (this.object.rollType === 'social') {
                this.object.difficulty += data.resolve;
            }
        }
        this.render();
    }

    async addOpposingCharm(charm) {
        if (this.object.rollType === 'useOpposingCharms') {
            this.addCharm(charm);
        } else {
            await this.addOpposedBonus(charm);
            this.render();
        }
    }

    async addOpposedBonus(charm) {
        const addedCharm = this.object.opposingCharms.find(opposedCharm => charm._id === opposedCharm._id);
        if (addedCharm) {
            addedCharm.timesAdded++;
        }
        else {
            charm.timesAdded = 1;
            this.object.opposingCharms.push(charm);
        }
        this.object.targetNumber += charm.system.diceroller.opposedbonuses.increasetargetnumber;
        this.object.rerollSuccesses += this._getFormulaValue(charm.system.diceroller.opposedbonuses.rerollsuccesses);
        this.object.gambitDifficulty += this._getFormulaValue(charm.system.diceroller.opposedbonuses.increasegambitdifficulty, charm.actor);
        if (this.object.showTargets) {
            const targetValues = Object.values(this.object.targets);
            if (targetValues.length === 1) {
                targetValues[0].rollData.guile += this._getFormulaValue(charm.system.diceroller.opposedbonuses.guile, charm.actor);
                targetValues[0].rollData.resolve += this._getFormulaValue(charm.system.diceroller.opposedbonuses.resolve, charm.actor);
                targetValues[0].rollData.defense += this._getFormulaValue(charm.system.diceroller.opposedbonuses.defense, charm.actor);
                targetValues[0].rollData.soak += this._getFormulaValue(charm.system.diceroller.opposedbonuses.soak, charm.actor);
                targetValues[0].rollData.shieldInitiative += this._getFormulaValue(charm.system.diceroller.opposedbonuses.shieldinitiative, charm.actor);
                targetValues[0].rollData.hardness += this._getFormulaValue(charm.system.diceroller.opposedbonuses.hardness, charm.actor);
                targetValues[0].rollData.diceModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.dicemodifier, charm.actor);
                targetValues[0].rollData.successModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
                targetValues[0].rollData.damageModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.damagemodifier, charm.actor);
                if (this.object.rollType === 'damage') {
                    targetValues[0].rollData.attackSuccesses += this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
                }
            }
            else {
                for (const target of targetValues) {
                    if (target.actor.id === charm.parent.id || targetValues.length === 1) {
                        target.rollData.guile += this._getFormulaValue(charm.system.diceroller.opposedbonuses.guile, charm.actor);
                        target.rollData.resolve += this._getFormulaValue(charm.system.diceroller.opposedbonuses.resolve, charm.actor);
                        target.rollData.defense += this._getFormulaValue(charm.system.diceroller.opposedbonuses.defense, charm.actor);
                        target.rollData.soak += this._getFormulaValue(charm.system.diceroller.opposedbonuses.soak, charm.actor);
                        target.rollData.shieldInitiative += this._getFormulaValue(charm.system.diceroller.opposedbonuses.shieldinitiative, charm.actor);
                        target.rollData.hardness += this._getFormulaValue(charm.system.diceroller.opposedbonuses.hardness, charm.actor);
                        target.rollData.diceModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.dicemodifier, charm.actor);
                        target.rollData.successModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
                        target.rollData.damageModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.damagemodifier, charm.actor);
                        if (this.object.rollType === 'damage') {
                            target.rollData.attackSuccesses += this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
                        }
                    }
                }
            }
        }
        else {
            this.object.defense += this._getFormulaValue(charm.system.diceroller.opposedbonuses.defense, charm.actor);
            this.object.soak += this._getFormulaValue(charm.system.diceroller.opposedbonuses.soak, charm.actor);
            this.object.shieldInitiative += this._getFormulaValue(charm.system.diceroller.opposedbonuses.shieldinitiative, charm.actor);
            this.object.hardness += this._getFormulaValue(charm.system.diceroller.opposedbonuses.hardness, charm.actor);
            this.object.diceModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.dicemodifier, charm.actor);
            this.object.successModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
            this.object.damage.damageDice += this._getFormulaValue(charm.system.diceroller.opposedbonuses.damagemodifier, charm.actor);
            if (this.object.rollType === 'readIntentions') {
                this.object.difficulty += this._getFormulaValue(charm.system.diceroller.opposedbonuses.guile, charm.actor);
            }
            if (this.object.rollType === 'social') {
                this.object.difficulty += this._getFormulaValue(charm.system.diceroller.opposedbonuses.resolve, charm.actor);
            }
            if (this.object.rollType === 'damage') {
                this.object.attackSuccesses += this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
            }
        }
        this.object.damage.targetNumber += charm.system.diceroller.opposedbonuses.increasedamagetargetnumber;
        if (charm.system.diceroller.opposedbonuses.triggeronones !== 'none') {
            this.object.settings.triggerOnOnes = charm.system.diceroller.opposedbonuses.triggeronones;
            this.object.settings.alsoTriggerTwos = charm.system.diceroller.opposedbonuses.alsotriggertwos;
        }
        this.object.settings.triggerOnesCap += this._getFormulaValue(charm.system.diceroller.opposedbonuses.triggeronescap);
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on("change", "#gambit", ev => {
            const gambitCosts = {
                'none': 0,
                'grapple': 2,
                'unhorse': 4,
                'distract': 3,
                'disarm': 3,
                'detonate': 4,
                'knockback': 3,
                'knockdown': 3,
                'pilfer': 2,
                'pull': 3,
                'revealWeakness': 2,
                'bind': 2,
                'goad': 3,
                'leech': 3,
                'pileon': 2,
                'riposte': 1,
                'blockvision': 3,
                'disablearm': 5,
                'disableleg': 6,
                'breachframe': 9,
                'entangle': 2,
            }
            this.object.gambitDifficulty = gambitCosts[this.object.gambit];
            if (this.object.gambit === 'disarm' && this.object.weaponTags['disarming']) {
                this.object.gambitDifficulty--;
            }
            if ((this.object.gambit === 'knockback' || this.object.gambit === 'knockdown') && this.object.weaponTags['smashing']) {
                this.object.gambitDifficulty--;
            }
            this.render();
        });

        html.on("change", "#craft-type", ev => {
            this.object.intervals = 1;
            this.object.difficulty = 1;
            this.object.goalNumber = 0;
            this._getCraftDifficulty();
            this.render();
        });

        html.on("change", "#craft-rating", ev => {
            if (parseInt(this.object.craftRating) === 2) {
                this.object.goalNumber = 30;
            }
            if (parseInt(this.object.craftRating) === 3) {
                this.object.goalNumber = 50;
            }
            if (parseInt(this.object.craftRating) === 4) {
                this.object.goalNumber = 75;
            }
            if (parseInt(this.object.craftRating) === 5) {
                this.object.goalNumber = 100;
            }
            this.render();
        });

        html.on("change", "#working-finesse", ev => {
            this.object.difficulty = parseInt(this.object.finesse);
            this.render();
        });

        html.on("change", "#working-ambition", ev => {
            this.object.goalNumber = parseInt(this.object.ambition);
            this.render();
        });

        html.on("change", ".spell", ev => {
            const fullSpell = this.actor.items.get(this.object.spell);
            if (fullSpell) {
                this.object.cost.willpower = parseInt(fullSpell.system.willpower);
            }
            else {
                this.object.cost.willpower = 0;
            }
            this.render();
        });

        html.on("change", "#update-damage-type", ev => {
            this.render();
        });

        html.find('#roll-button').click((event) => {
            if (this.object.rollType === 'useOpposingCharms') {
                this.useOpposingCharms();
            }
            else {
                this._roll();
                if (this.object.intervals <= 0 && (!this.object.splitAttack || this.object.rollType === 'damage')) {
                    this.resolve(true);
                    this.close();
                }
            }

        });

        html.find('#save-button').click((event) => {
            this._saveRoll(this.object);
            if (this.object.intervals <= 0) {
                this.close();
            }
        });


        html.find('.add-special-attack').click((ev) => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let id = li.data("item-id");
            for (var specialAttack of this.object.specialAttacksList) {
                if (specialAttack.id === id) {
                    specialAttack.added = true;
                }
            }
            if (id === 'aim') {
                this.object.diceModifier += 3;
            }
            else if (id === 'impale') {
                if (this.object.attackType === 'withering') {
                    this.object.damage.damageDice += 5;
                }
                else {
                    this.object.damage.damageDice += 3;
                }
            }
            else {
                if (id === 'knockback' || id === 'knockdown') {
                    this.object.cost.initiative += 2;
                    if (id === 'knockdown') {
                        this.object.triggerKnockdown = true;
                    }
                }
                else if (id === 'flurry') {
                    this.object.isFlurry = true;
                }
                else {
                    this.object.cost.initiative += 1;
                }
                if (id === 'chopping' && this.object.attackType === 'withering') {
                    this.object.damage.damageDice += 3;
                }
                if (id === 'piercing' && this.object.attackType === 'withering') {
                    this.object.damage.ignoreSoak += 4;
                }
                else if (id === 'fulldefense') {
                    this.object.diceModifier -= 3;
                    this.object.cost.initiative += 1;
                    this.object.triggerFullDefense = true;
                }
                this.object.triggerSelfDefensePenalty += 1;
            }
            this.render();
        });

        html.find('.remove-special-attack').click((ev) => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let id = li.data("item-id");
            for (var specialAttack of this.object.specialAttacksList) {
                if (specialAttack.id === id) {
                    specialAttack.added = false;
                }
            }
            if (id === 'aim') {
                this.object.diceModifier -= 3;
            }
            else if (id === 'impale') {
                if (this.object.attackType === 'withering') {
                    this.object.damage.damageDice -= 5;
                }
                else {
                    this.object.damage.damageDice -= 3;
                }
            }
            else {
                if (id === 'knockback' || id === 'knockdown') {
                    this.object.cost.initiative -= 2;
                    if (id === 'knockdown') {
                        this.object.triggerKnockdown = false;
                    }
                }
                else if (id === 'flurry') {
                    this.object.isFlurry = false;
                }
                else {
                    this.object.cost.initiative -= 1;
                }
                if (id === 'chopping' && this.object.attackType === 'withering') {
                    this.object.damage.damageDice -= 3;
                }
                if (id === 'piercing' && this.object.attackType === 'withering') {
                    this.object.damage.ignoreSoak -= 4;
                }
                else if (id === 'fulldefense') {
                    this.object.diceModifier += 3;
                    this.object.cost.initiative -= 1;
                    this.object.triggerFullDefense = true;
                }
                this.object.triggerSelfDefensePenalty = Math.max(0, this.object.triggerSelfDefensePenalty - 1);
            }
            this.render();
        });

        html.find('.add-charm').click(ev => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let item = this.actor.items.get(li.data("item-id"));
            this.addCharm(item);
        });

        html.find('.remove-charm').click(ev => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let item = this.actor.items.get(li.data("item-id"));
            const index = this.object.addedCharms.findIndex(addedItem => item.id === addedItem.id);
            const addedCharm = this.object.addedCharms.find(addedItem => item.id === addedItem.id);
            if (index > -1) {
                if (addedCharm.timesAdded > 0) {
                    addedCharm.timesAdded--;
                }
                if (addedCharm.timesAdded <= 0) {
                    this.object.addedCharms.splice(index, 1);
                }

                for (var charmlist of Object.values(this.object.charmList)) {
                    for (const charm of charmlist.list) {
                        if (charm._id === item.id) {
                            charm.timesAdded = addedCharm.timesAdded;
                            if (charm.timesAdded <= 0) {
                                charm.charmAdded = false;
                            }
                        }
                    }
                }

                if (item.system.keywords.toLowerCase().includes('mute')) {
                    this.object.cost.muteMotes -= item.system.cost.motes;
                }
                else {
                    this.object.cost.motes -= item.system.cost.motes;
                }
                this.object.cost.anima -= item.system.cost.anima;
                this.object.cost.penumbra -= item.system.cost.penumbra;
                this.object.cost.willpower -= item.system.cost.willpower;
                this.object.cost.silverxp -= item.system.cost.silverxp;
                this.object.cost.goldxp -= item.system.cost.goldxp;
                this.object.cost.whitexp -= item.system.cost.whitexp;
                this.object.cost.initiative -= item.system.cost.initiative;
                this.object.cost.grappleControl -= item.system.cost.grapplecontrol;

                if (item.system.cost.aura === this.object.cost.aura) {
                    this.object.cost.aura = "";
                }

                if (item.system.cost.health > 0) {
                    if (item.system.cost.healthtype === 'bashing') {
                        this.object.cost.healthbashing -= item.system.cost.health;
                    }
                    else if (item.system.cost.healthtype === 'lethal') {
                        this.object.cost.healthlethal -= item.system.cost.health;
                    }
                    else {
                        this.object.cost.healthaggravated -= item.system.cost.health;
                    }
                }
                this.object.restore.motes -= item.system.restore.motes;
                this.object.restore.willpower -= item.system.restore.willpower;
                this.object.restore.health -= item.system.restore.health;
                this.object.restore.initiative -= item.system.restore.initiative;

                this.object.diceModifier -= this._getFormulaValue(item.system.diceroller.bonusdice);
                this.object.successModifier -= this._getFormulaValue(item.system.diceroller.bonussuccesses);

                this.object.triggerSelfDefensePenalty -= item.system.diceroller.selfdefensepenalty;
                this.object.triggerTargetDefensePenalty -= item.system.diceroller.targetdefensepenalty;

                if (!item.system.diceroller.settings.noncharmdice) {
                    this.object.charmDiceAdded = Math.max(0, this.object.charmDiceAdded - this._getFormulaValue(item.system.diceroller.bonusdice));
                }
                if (!item.system.diceroller.settings.noncharmsuccesses) {
                    this.object.charmDiceAdded = Math.max(0, this.object.charmDiceAdded - (this._getFormulaValue(item.system.diceroller.bonussuccesses) * 2));
                }
                this.object.targetNumber += item.system.diceroller.decreasetargetnumber;
                for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.reroll)) {
                    if (rerollValue) {
                        this.object.reroll[rerollKey].status = false;
                    }
                }
                if (item.system.diceroller.rolltwice) {
                    this.object.rollTwice = false;
                }
                if (item.system.diceroller.rerollfailed) {
                    this.object.rerollFailed = false;
                }
                this.object.rerollNumber -= this._getFormulaValue(item.system.diceroller.rerolldice);
                this.object.diceToSuccesses -= this._getFormulaValue(item.system.diceroller.diceToSuccesses);
                if (this.object.showTargets) {
                    const targetValues = Object.values(this.object.targets);
                    for (const target of targetValues) {
                        target.rollData.defense += this._getFormulaValue(item.system.diceroller.reducedifficulty);
                        target.rollData.resolve += this._getFormulaValue(item.system.diceroller.reducedifficulty);
                        target.rollData.guile += this._getFormulaValue(item.system.diceroller.reducedifficulty);
                        if (this.object.rollType === 'damage') {
                            target.rollData.attackSuccesses -= this._getFormulaValue(item.system.diceroller.bonussuccesses);
                        }
                    }
                }
                else {
                    this.object.difficulty += this._getFormulaValue(item.system.diceroller.reducedifficulty);
                    this.object.defense += this._getFormulaValue(item.system.diceroller.reducedifficulty);
                    if (this.object.rollType === 'damage') {
                        this.object.attackSuccesses -= this._getFormulaValue(item.system.diceroller.bonussuccesses);
                    }
                }


                for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.rerollcap)) {
                    if (rerollValue) {
                        this.object.reroll[rerollKey].cap -= this._getFormulaValue(rerollValue);
                    }
                }
                for (let [key, value] of Object.entries(item.system.diceroller.doublesucccesscaps)) {
                    if (value) {
                        this.object.settings.doubleSucccessCaps[key] -= this._getFormulaValue(value);
                    }
                }
                if (item.system.diceroller.ignorelegendarysize) {
                    this.object.settings.ignoreLegendarySize = false;
                }
                if (item.system.diceroller.excludeonesfromrerolls) {
                    this.object.settings.excludeOnesFromRerolls = false;
                }

                this.object.damage.damageDice -= this._getFormulaValue(item.system.diceroller.damage.bonusdice);
                this.object.damage.damageSuccessModifier -= this._getFormulaValue(item.system.diceroller.damage.bonussuccesses);
                this.object.damage.targetNumber += item.system.diceroller.damage.decreasetargetnumber;
                this.object.overwhelming -= this._getFormulaValue(item.system.diceroller.damage.overwhelming);
                this.object.damage.postSoakDamage -= this._getFormulaValue(item.system.diceroller.damage.postsoakdamage);
                this.object.damage.diceToSuccesses -= this._getFormulaValue(item.system.diceroller.damage.dicetosuccesses);

                this.object.damage.ignoreSoak -= this._getFormulaValue(item.system.diceroller.damage.ignoresoak);
                this.object.damage.ignoreHardness -= this._getFormulaValue(item.system.diceroller.damage.ignorehardness);

                for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.damage.reroll)) {
                    if (rerollValue) {
                        this.object.damage.reroll[rerollKey].status = false;
                    }
                }
                if (item.system.diceroller.damage.rerollfailed) {
                    this.object.damage.rerollFailed = false;
                }
                if (item.system.diceroller.damage.rolltwice) {
                    this.object.damage.rollTwice = false;
                }
                this.object.damage.rerollNumber -= this._getFormulaValue(item.system.diceroller.damage.rerolldice);
                if (item.system.diceroller.damage.threshholdtodamage) {
                    this.object.damage.threshholdToDamage = false;
                }
                if (item.system.diceroller.damage.doublerolleddamage) {
                    this.object.damage.doubleRolledDamage = false;
                }
                this.object.damage.ignoreSoak -= this._getFormulaValue(item.system.diceroller.damage.ignoresoak);
                for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.damage.rerollcap)) {
                    if (rerollValue) {
                        this.object.damage.reroll[rerollKey].cap -= this._getFormulaValue(rerollValue);
                    }
                }
                for (let [key, value] of Object.entries(item.system.diceroller.damage.doublesucccesscaps)) {
                    if (value) {
                        this.object.settings.damage.doubleSucccessCaps[key] -= this._getFormulaValue(value);
                    }
                }
                if (item.system.diceroller.damage.excludeonesfromrerolls) {
                    this.object.settings.damage.excludeOnesFromRerolls = false;
                }
                if (addedCharm.timesAdded === 0 && item.system.diceroller.activateAura === this.object.activateAura) {
                    this.object.activateAura = 'none';
                }
                if (addedCharm.timesAdded === 0 && item.system.diceroller.triggerontens === this.object.settings.triggerOnTens) {
                    this.object.settings.triggerOnTens = 'none';
                    this.object.settings.alsoTriggerNines = false;
                }
                this.object.settings.triggerTensCap -= this._getFormulaValue(item.system.diceroller.triggertenscap);
                if (item.system.diceroller.damage.triggerontens !== 'none') {
                    this.object.settings.damage.triggerOnTens = 'none';
                    this.object.settings.damage.alsoTriggerNines = false;
                }
                this.object.settings.damage.triggerTensCap -= this._getFormulaValue(item.system.diceroller.damage.triggertenscap);
                this.object.settings.triggerOnesCap -= this._getFormulaValue(item.system.diceroller.triggeronescap);
            }
            this._calculateAnimaGain();
            this.render();
        });

        html.find('.remove-opposing-charm').click(ev => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let id = li.data("item-id");
            const charm = this.object.opposingCharms.find(opposedCharm => id === opposedCharm._id);
            const index = this.object.opposingCharms.findIndex(opposedCharm => id === opposedCharm._id);
            if (charm) {
                if (charm.timesAdded <= 1) {
                    this.object.opposingCharms.splice(index, 1);
                }
                else {
                    charm.timesAdded--;
                }
                this.object.targetNumber -= charm.system.diceroller.opposedbonuses.increasetargetnumber;
                this.object.rerollSuccesses -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.rerollsuccesses);
                this.object.gambitDifficulty -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.increasegambitdifficulty, charm.actor);
                if (this.object.showTargets) {
                    const targetValues = Object.values(this.object.targets);
                    if (targetValues.length === 1) {
                        targetValues[0].rollData.guile -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.guile, charm.actor);
                        targetValues[0].rollData.resolve -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.resolve, charm.actor);
                        targetValues[0].rollData.defense -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.defense, charm.actor);
                        targetValues[0].rollData.soak -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.soak, charm.actor);
                        targetValues[0].rollData.shieldInitiative -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.shieldinitiative, charm.actor);
                        targetValues[0].rollData.hardness -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.hardness, charm.actor);
                        targetValues[0].rollData.diceModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.dicemodifier, charm.actor);
                        targetValues[0].rollData.successModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
                        targetValues[0].rollData.damageModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.damagemodifier, charm.actor);
                        if (this.object.rollType === 'damage') {
                            targetValues[0].rollData.attackSuccesses -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
                        }
                    }
                    else {
                        for (const target of targetValues) {
                            if (target.actor.id === charm.parent.id || targetValues.length === 1) {
                                target.rollData.guile -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.guile, charm.actor);
                                target.rollData.resolve -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.resolve, charm.actor);
                                target.rollData.defense -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.defense, charm.actor);
                                target.rollData.soak -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.soak, charm.actor);
                                target.rollData.shieldInitiative -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.shieldinitiative, charm.actor);
                                target.rollData.hardness -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.hardness, charm.actor);
                                target.rollData.diceModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.dicemodifier, charm.actor);
                                target.rollData.successModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
                                target.rollData.damageModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.damagemodifier, charm.actor);
                                if (this.object.rollType === 'damage') {
                                    target.rollData.attackSuccesses -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
                                }
                            }
                        }
                    }
                }
                else {
                    this.object.defense -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.defense, charm.actor);
                    this.object.soak -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.soak, charm.actor);
                    this.object.shieldInitiative -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.shieldinitiative, charm.actor);
                    this.object.hardness -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.hardness, charm.actor);
                    this.object.diceModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.dicemodifier, charm.actor);
                    this.object.successModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
                    this.object.damage.damageDice -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.damagemodifier, charm.actor);
                    if (this.object.rollType === 'readIntentions') {
                        this.object.difficulty -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.guile, charm.actor);
                    }
                    if (this.object.rollType === 'social') {
                        this.object.difficulty -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.resolve, charm.actor);
                    }
                    if (this.object.rollType === 'damage') {
                        this.object.attackSuccesses -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
                    }
                }
                this.object.damage.targetNumber -= charm.system.diceroller.opposedbonuses.increasedamagetargetnumber;
                if (charm.system.diceroller.opposedbonuses.triggeronones !== 'none') {
                    this.object.settings.triggerOnOnes = 'none';
                    this.object.settings.alsoTriggerTwos = false;
                }
                this.object.settings.triggerOnesCap -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.triggeronescap);
            }
            this.render();
        });

        html.find('#done-adding-charms').click(ev => {
            this.object.addingCharms = false;
            this.object.showSpecialAttacks = false;
            this.render();
        });

        html.on("change", ".update-roller", ev => {
            this.object.diceCap = this._getDiceCap();
            this.render();
        });

        html.on("change", ".update-specialties", ev => {
            this._updateSpecialtyList();
            this.render();
        });

        html.find('#cancel').click((event) => {
            this.resolve(false);
            this.close();
        });

        html.find('.collapsable').click(ev => {
            const li = $(ev.currentTarget).next();
            if (li.attr('id')) {
                this.object[li.attr('id')] = li.is(":hidden");
            }
            li.toggle("fast");
        });

        html.find('.charm-list-collapsable').click(ev => {
            const li = $(ev.currentTarget).next();
            if (li.attr('id')) {
                this.object.charmList[li.attr('id')].collapse = !li.is(":hidden");
            }
            li.toggle("fast");
        });

        html.on("change", ".update-motes", ev => {
            this._calculateAnimaGain();
            this.render();
        });
    }

    async _roll() {
        if (this._isAttackRoll()) {
            this.object.gainedInitiative = 0;
            this.object.crashed = false;
            this.object.targetHit = false;
            if (this.object.showTargets) {
                for (const target of Object.values(this.object.targets)) {
                    this.object.target = target;
                    this.object.newTargetData = duplicate(target.actor);
                    this.object.updateTargetActorData = false;
                    this.object.updateTargetInitiative = false;
                    this.object.newTargetInitiative = null;
                    this.object.targetCombatant = null;
                    if (target.actor?.token?.id || target.actor.getActiveTokens()[0]) {
                        const tokenId = target.actor?.token?.id || target.actor.getActiveTokens()[0].id;
                        this.object.targetCombatant = game.combat?.combatants?.find(c => c.tokenId === tokenId) || null;
                        if (this.object.targetCombatant && this.object.targetCombatant.initiative !== null) {
                            this.object.newTargetInitiative = this.object.targetCombatant.initiative;
                        }
                    }
                    this.object.soak = target.rollData.soak;
                    this.object.shieldInitiative = target.rollData.shieldInitiative;
                    this.object.hardness = target.rollData.hardness;
                    this.object.defense = target.rollData.defense;
                    this.object.attackSuccesses = target.rollData.attackSuccesses;
                    this.object.targetSpecificDiceMod = target.rollData.diceModifier;
                    this.object.targetSpecificSuccessMod = target.rollData.successModifier;
                    this.object.targetSpecificDamageMod = target.rollData.damageModifier;

                    await this._attackRoll();
                    if (this.object.updateTargetActorData) {
                        await this._updateTargetActor();
                    }
                    if (this.object.updateTargetInitiative) {
                        await this._updateTargetInitiative();
                    }
                }
            }
            else {
                await this._attackRoll();
                if (this.object.updateTargetActorData) {
                    await this._updateTargetActor();
                }
                if (this.object.updateTargetInitiative) {
                    await this._updateTargetInitiative();
                }
            }
            this._postAttackResults();
        }
        else if (this.object.rollType === 'base') {
            await this._diceRoll();
        }
        else if (this.object.hasIntervals) {
            this.object.intervals -= 1;
            await this._completeCraftProject();
        }
        else if (this.object.showTargets && (this.object.rollType === 'social' || this.object.rollType === 'readIntentions')) {
            this.object.hasDifficulty = true;
            if (this.object.showTargets) {
                for (const target of Object.values(this.object.targets)) {
                    this.object.target = target;
                    this.object.newTargetData = duplicate(target.actor);
                    this.object.updateTargetActorData = false;
                    if (this.object.rollType === 'social') {
                        this.object.difficulty = target.rollData.resolve;
                        this.object.difficulty = Math.max(0, this.object.difficulty + parseInt(target.rollData.opposedIntimacy || 0) - parseInt(target.rollData.supportedIntimacy || 0));
                    }
                    if (this.object.rollType === 'readIntentions') {
                        this.object.difficulty = target.rollData.guile;
                    }
                    this.object.opposedIntimacy = target.rollData.opposedIntimacy;
                    this.object.supportedIntimacy = target.rollData.supportedIntimacy;
                    this.object.appearanceBonus = target.rollData.appearanceBonus;
                    await this._abilityRoll();
                    if (this.object.updateTargetActorData) {
                        await this._updateTargetActor();
                    }
                }
            }
        }
        else {
            await this._abilityRoll();
            if (this.object.updateTargetActorData) {
                await this._updateTargetActor();
            }
        }
    }

    async useOpposingCharms() {
        const addingCharms = [];
        for (const charm of this.object.addedCharms) {
            const newCharm = duplicate(charm);
            newCharm.timesAdded = charm.timesAdded;
            addingCharms.push(newCharm);
        }
        const data = {
            charmList: addingCharms,
            defense: this.object.addOppose.defense,
            dice: this.object.addOppose.dice,
            soak: this.object.addOppose.soak,
            guile: this.object.addOppose.guile,
            resolve: this.object.addOppose.resolve,
            hardness: this.object.addOppose.hardness,
        }

        // if (game.rollForm) {
        //     data.actor = this.actor;
        //     game.rollForm.addMultiOpposedBonuses(data);
        // }

        game.socket.emit('system.exaltedthird', {
            type: 'addMultiOpposingCharms',
            data: data,
            actorId: this.actor._id,
        });
        await this._updateCharacterResources();
        this.close();
    }

    async _updateSpecialtyList() {
        const customAbility = this.actor.customabilities.find(x => x._id === this.object.ability);
        if (customAbility) {
            if (customAbility.system.abilitytype === 'craft') {
                this.object.specialtyList = this.actor.specialties.filter((specialty) => specialty.system.ability === 'craft');
            }
            else if (customAbility.system.abilitytype === 'martialarts') {
                this.object.specialtyList = this.actor.specialties.filter((specialty) => specialty.system.ability === 'martialarts');
            }
        }
        else {
            if (this.actor.type === 'npc') {
                this.object.specialtyList = this.actor.specialties;
            }
            else {
                this.object.specialtyList = this.actor.specialties.filter((specialty) => specialty.system.ability === this.object.ability);
            }
        }
    }

    // Dovie'andi se tovya sagain.
    async _rollTheDice(dice, diceModifiers, doublesRolled, numbersRerolled) {
        var total = 0;
        var tensTriggered = 0;
        var onesTriggered = 0;
        var results = null;
        const numbersChart = {
            1: 'one',
            2: 'two',
            3: 'three',
            4: 'four',
            5: 'five',
            6: 'six',
            7: 'seven',
            8: 'eight',
            9: 'nine',
            10: 'ten',
        }
        const doublesChart = {
            7: 'sevens',
            8: 'eights',
            9: 'nines',
            10: 'tens',
        }
        let rerolls = [];
        for (var rerollValue in diceModifiers.reroll) {
            if (diceModifiers.reroll[rerollValue].status) {
                rerolls.push(diceModifiers.reroll[rerollValue].number);
            }
        }
        var roll = await new Roll(`${dice}d10cs>=${diceModifiers.targetNumber}`).evaluate();
        results = roll.dice[0].results;
        total = roll.total;
        if (rerolls.length > 0) {
            while (results.some(dieResult => (rerolls.includes(dieResult.result) && !dieResult.rerolled && (diceModifiers.reroll[numbersChart[dieResult.result]].cap === 0 || diceModifiers.reroll[numbersChart[dieResult.result]].cap > numbersRerolled[dieResult.result])))) {
                var toReroll = 0;
                for (const diceResult of results) {
                    if (!diceResult.rerolled && rerolls.includes(diceResult.result)) {
                        if (diceModifiers.reroll[numbersChart[diceResult.result]].cap === 0 || diceModifiers.reroll[numbersChart[diceResult.result]].cap > numbersRerolled[diceResult.result]) {
                            toReroll++;
                            numbersRerolled[diceResult.result] += 1;
                            diceResult.rerolled = true;
                        }
                    }
                }
                var rerollRoll = await new Roll(`${toReroll}d10cs>=${diceModifiers.targetNumber}`).evaluate();
                results = results.concat(rerollRoll.dice[0].results);
                total += rerollRoll.total;
            }
        }
        for (let dice of results) {
            if (dice.result >= diceModifiers.doubleSuccess && dice.result >= diceModifiers.targetNumber) {
                if (diceModifiers.settings.doubleSucccessCaps[doublesChart[dice.result]] === 0 || diceModifiers.settings.doubleSucccessCaps[doublesChart[dice.result]] > doublesRolled[dice.result]) {
                    total += 1;
                    dice.doubled = true;
                    doublesRolled[dice.result] += 1;
                }
            }
            if ((dice.result === 10 || (dice.result === 9 && diceModifiers.settings.alsoTriggerNines)) && diceModifiers.settings.triggerOnTens === 'rerolllDie' && (diceModifiers.settings.triggerTensCap === 0 || diceModifiers.settings.triggerTensCap > tensTriggered)) {
                diceModifiers.rerollNumber += 1;
                tensTriggered += 1;
            }
            if ((dice.result === 1 || (dice.result === 2 && diceModifiers.settings.alsoTriggerTwos)) && diceModifiers.settings.triggerOnOnes === 'rerollSuccesses' && (diceModifiers.settings.triggerOnesCap === 0 || diceModifiers.settings.triggerOnesCap > onesTriggered)) {
                diceModifiers.rerollSuccesses += 1;
                onesTriggered += 1;
            }
        }

        let rollResult = {
            roll: roll,
            results: results,
            total: total,
        };

        return rollResult;
    }

    async _calculateRoll(dice, diceModifiers) {
        const doublesRolled = {
            7: 0,
            8: 0,
            9: 0,
            10: 0,
        }
        const numbersRerolled = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0,
            9: 0,
            10: 0,
        }

        if (diceModifiers.preRollMacros.length > 0) {
            let results = {};
            results = diceModifiers.preRollMacros.reduce((carry, macro) => macro(carry, dice, diceModifiers, doublesRolled, numbersRerolled), results);
        }
        //Base Roll
        let rollResults = await this._rollTheDice(dice, diceModifiers, doublesRolled, numbersRerolled);
        let diceRoll = rollResults.results;
        let total = rollResults.total;
        var possibleRerolls = 0;
        var possibleSuccessRerolls = 0;
        // Reroll Failed Number
        if (diceModifiers.rerollFailed) {
            for (const diceResult of diceRoll.sort((a, b) => a.result - b.result)) {
                if (!diceResult.rerolled && diceResult.result < this.object.targetNumber && (!diceModifiers.settings.excludeOnesFromRerolls || diceResult.result !== 1)) {
                    possibleRerolls++;
                    diceResult.rerolled = true;
                }
            }
            var failedDiceRollResult = await this._rollTheDice(possibleRerolls, diceModifiers, doublesRolled, numbersRerolled);
            diceRoll = diceRoll.concat(failedDiceRollResult.results);
            total += failedDiceRollResult.total;
        }

        possibleRerolls = 0;
        possibleSuccessRerolls = 0;
        for (const diceResult of diceRoll.sort((a, b) => a.result - b.result)) {
            if (diceModifiers.rerollNumber > possibleRerolls && !diceResult.rerolled && diceResult.result < this.object.targetNumber && (!diceModifiers.settings.excludeOnesFromRerolls || diceResult.result !== 1)) {
                possibleRerolls++;
                diceResult.rerolled = true;
            }
            if (diceModifiers.rerollSuccesses > possibleSuccessRerolls && !diceResult.rerolled && diceResult.result >= this.object.targetNumber) {
                possibleSuccessRerolls++;
                total--;
                if (diceResult.doubled) {
                    total--;
                }
                diceResult.rerolled = true;
                diceResult.successCanceled = true;
            }
        }

        var diceToReroll = Math.min(possibleRerolls, diceModifiers.rerollNumber);
        let rerolledDice = 0;
        while (diceToReroll > 0 && (rerolledDice < diceModifiers.rerollNumber)) {
            rerolledDice += possibleRerolls;
            var rerollNumDiceResults = await this._rollTheDice(diceToReroll, diceModifiers, doublesRolled, numbersRerolled);
            diceToReroll = 0
            for (const diceResult of rerollNumDiceResults.results.sort((a, b) => a.result - b.result)) {
                if (diceModifiers.rerollNumber > possibleRerolls && !diceResult.rerolled && diceResult.result < this.object.targetNumber && (!diceModifiers.settings.excludeOnesFromRerolls || diceResult.result !== 1)) {
                    possibleRerolls++;
                    diceToReroll++;
                    diceResult.rerolled = true;
                }
            }
            diceRoll = diceRoll.concat(rerollNumDiceResults.results);
            total += rerollNumDiceResults.total;
        }
        var successesToReroll = Math.min(possibleSuccessRerolls, diceModifiers.rerollSuccesses);
        let successRerolledDice = 0;
        while (successesToReroll > 0 && (successRerolledDice < diceModifiers.rerollSuccesses)) {
            successRerolledDice += possibleSuccessRerolls;
            var rerollNumDiceResults = await this._rollTheDice(successesToReroll, diceModifiers, doublesRolled, numbersRerolled);
            successesToReroll = 0
            for (const diceResult of rerollNumDiceResults.results.sort((a, b) => a.result - b.result)) {
                if (diceModifiers.rerollSuccesses > possibleSuccessRerolls && !diceResult.rerolled && diceResult.result >= this.object.targetNumber) {
                    possibleSuccessRerolls++;
                    successesToReroll++;
                    total--;
                    if (diceResult.doubled) {
                        total--;
                    }
                    diceResult.rerolled = true;
                    diceResult.successCanceled = true;
                }
            }
            diceRoll = diceRoll.concat(rerollNumDiceResults.results);
            total += rerollNumDiceResults.total;
        }
        total += diceModifiers.successModifier;
        if (this.object.craft.divineInsperationTechnique || this.object.craft.holisticMiracleUnderstanding) {
            let newCraftDice = Math.floor(total / 3);
            let remainder = total % 3;
            while (newCraftDice > 0) {
                var rollSuccessTotal = 0;
                var craftDiceRollResults = await this._rollTheDice(newCraftDice, diceModifiers, doublesRolled, numbersRerolled);
                diceRoll = diceRoll.concat(craftDiceRollResults.results);
                rollSuccessTotal += craftDiceRollResults.total;
                total += craftDiceRollResults.total;
                newCraftDice = Math.floor((rollSuccessTotal + remainder) / 3);
                remainder = rollSuccessTotal % 3;
                if (this.object.craft.holisticMiracleUnderstanding) {
                    newCraftDice * 4;
                }
            }
        }

        if (diceModifiers.macros.length > 0) {
            let newResults = { ...rollResults, results: diceRoll, total };
            newResults = diceModifiers.macros.reduce((carry, macro) => macro(carry, dice, diceModifiers, doublesRolled, numbersRerolled), newResults);
            total = newResults.total;
            rollResults = newResults;
        }
        // let newResults = { ...rollResults, results: diceRoll, total };
        // this._testMacro(newResults, dice, diceModifiers, doublesRolled, numbersRerolled);
        rollResults.roll.dice[0].results = diceRoll;

        let diceDisplay = "";
        for (let dice of diceRoll.sort((a, b) => b.result - a.result)) {
            if (dice.successCanceled) { diceDisplay += `<li class="roll die d10 rerolled">${dice.result}</li>`; }
            else if (dice.doubled) {
                diceDisplay += `<li class="roll die d10 success double-success">${dice.result}</li>`;
            }
            else if (dice.result >= diceModifiers.targetNumber) { diceDisplay += `<li class="roll die d10 success">${dice.result}</li>`; }
            else if (dice.rerolled) { diceDisplay += `<li class="roll die d10 rerolled">${dice.result}</li>`; }
            else if (dice.result == 1) { diceDisplay += `<li class="roll die d10 failure">${dice.result}</li>`; }
            else { diceDisplay += `<li class="roll die d10">${dice.result}</li>`; }
        }

        return {
            roll: rollResults.roll,
            diceDisplay: diceDisplay,
            total: total,
            diceRoll: diceRoll,
        };
    }

    // _testMacro(rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) {
    //     let combatant = this._getActorCombatant();
    //     if (combatant && combatant.initiative != null && combatant.initiative >= 15) {
    //         this.object.damage.damageDice += this.actor.system.attributes.dexterity;
    //     }
    //     else {
    //         this.object.damage.damageDice += Math.ceil(this.actor.system.attributes.dexterity / 2);
    //     }
    //     let { results, roll, total } = rollResult;
    //     return { results, roll, total };
    // }

    async _baseAbilityDieRoll() {
        await this._addTriggerBonuses('beforeRoll');

        let dice = 0;
        let successes = 0;

        if (this.object.rollType === 'base') {
            dice = this.object.dice;
            successes = this.object.successModifier;
        }
        else {
            const data = this.actor.system;
            const actorData = duplicate(this.actor);
            if (this.actor.type === 'character') {
                if (data.attributes[this.object.attribute]) {
                    dice += data.attributes[this.object.attribute]?.value || 0;
                }
                dice += this._getCharacterAbilityValue(this.actor, this.object.ability);
            }
            else if (this.actor.type === 'npc' && !this._isAttackRoll()) {
                if (this.object.actions.some(action => action._id === this.object.pool)) {
                    dice += this.actor.actions.find(x => x._id === this.object.pool).system.value;
                }
                else if (this.object.pool === 'willpower') {
                    dice += this.actor.system.willpower.max;
                } else {
                    dice += data.pools[this.object.pool].value;
                }
            }

            if (this.object.armorPenalty) {
                for (let armor of this.actor.armor) {
                    if (armor.system.equipped) {
                        dice -= Math.abs(armor.system.penalty);
                    }
                }
            }
            if (this.object.willpower) {
                successes++;
                this.object.cost.willpower++;
            }
            if (this.object.stunt !== 'none' && this.object.stunt !== 'bank') {
                dice += 2;
            }
            if (this.object.stunt === 'two') {
                if (this.object.willpower) {
                    this.object.cost.willpower--;
                }
                else if (actorData.system.willpower.value < actorData.system.willpower.max) {
                    actorData.system.willpower.value++;
                }
                successes++;
            }
            if (this.object.stunt === 'three') {
                actorData.system.willpower.value += 2;
                successes += 2;
            }
            if (this.object.diceToSuccesses > 0) {
                successes += Math.min(dice, this.object.diceToSuccesses);
                dice = Math.max(0, dice - this.object.diceToSuccesses);
            }
            if (this.object.woundPenalty && data.health.penalty !== 'inc') {
                if (data.warstrider.equipped) {
                    dice -= data.warstrider.health.penalty;
                }
                else {
                    dice -= Math.max(0, data.health.penalty - data.health.penaltymod);
                }
            }
            if (this.object.isFlurry) {
                dice -= 3;
            }
            if (this.object.diceModifier) {
                dice += this.object.diceModifier;
            }
            if (this.object.successModifier) {
                successes += this.object.successModifier;
            }
            if (this.object.targetSpecificDiceMod) {
                dice += this.object.targetSpecificDiceMod;
            }
            if (this.object.targetSpecificSuccessMod) {
                successes += this.object.targetSpecificSuccessMod;
            }
            if (this.object.specialty) {
                dice++;
            }
            if (this.object.rollType === 'social') {
                if (this.object.applyAppearance) {
                    dice += this.object.appearanceBonus;
                }
            }
            await this.actor.update(actorData);
        }

        if (this._isAttackRoll()) {
            if (this.object.weaponType !== 'melee' && (this.actor.type === 'npc' || this.object.attackType === 'withering')) {
                if (this.object.range !== 'short') {
                    dice += this._getRangedAccuracy();
                }
            }
        }

        if (dice < 0) {
            dice = 0;
        }
        this.object.dice = dice;
        this.object.successes = successes;


        var rollModifiers = {
            successModifier: this.object.successes,
            doubleSuccess: this.object.doubleSuccess,
            targetNumber: this.object.targetNumber,
            reroll: this.object.reroll,
            rerollFailed: this.object.rerollFailed,
            rerollNumber: this.object.rerollNumber,
            rerollSuccesses: this.object.rerollSuccesses || 0,
            settings: this.object.settings,
            preRollMacros: [],
            macros: [],
        }

        for (let charm of this.object.addedCharms) {
            if (charm.system.prerollmacro) {
                let macro = new Function('rollResult', 'dice', 'diceModifiers', 'doublesRolled', 'numbersRerolled', charm.system.prerollmacro);
                rollModifiers.preRollMacros.push((rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) => {
                    try {
                        this.object.currentMacroCharm = charm;
                        this.object.opposedCharmMacro = false;
                        return macro.call(this, rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) ?? rollResult
                    } catch (e) {
                        ui.notifications.error(`<p>There was an error in your macro syntax for "${charm.name}":</p><pre>${e.message}</pre><p>See the console (F12) for details</p>`);
                        console.error(e);
                    }
                    return rollResult;
                });
            }
            if (charm.system.macro) {
                let macro = new Function('rollResult', 'dice', 'diceModifiers', 'doublesRolled', 'numbersRerolled', charm.system.macro);
                rollModifiers.macros.push((rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) => {
                    try {
                        this.object.currentMacroCharm = charm;
                        this.object.opposedCharmMacro = false;
                        return macro.call(this, rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) ?? rollResult
                    } catch (e) {
                        ui.notifications.error(`<p>There was an error in your macro syntax for "${charm.name}":</p><pre>${e.message}</pre><p>See the console (F12) for details</p>`);
                        console.error(e);
                    }
                    return rollResult;
                });
            }
        }

        for (let charm of this.object.opposingCharms) {
            if (charm.system.prerollmacro) {
                let macro = new Function('rollResult', 'dice', 'diceModifiers', 'doublesRolled', 'numbersRerolled', charm.system.prerollmacro);
                rollModifiers.preRollMacros.push((rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) => {
                    try {
                        this.object.opposedCharmMacro = true;
                        this.object.currentMacroCharm = charm;
                        return macro.call(this, rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) ?? rollResult
                    } catch (e) {
                        ui.notifications.error(`<p>There was an error in your macro syntax for "${charm.name}":</p><pre>${e.message}</pre><p>See the console (F12) for details</p>`);
                        console.error(e);
                    }
                    return rollResult;
                });
            }
            if (charm.system.macro) {
                let macro = new Function('rollResult', 'dice', 'diceModifiers', 'doublesRolled', 'numbersRerolled', charm.system.macro);
                rollModifiers.macros.push((rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) => {
                    try {
                        this.object.opposedCharmMacro = true;
                        this.object.currentMacroCharm = charm;
                        return macro.call(this, rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) ?? rollResult
                    } catch (e) {
                        ui.notifications.error(`<p>There was an error in your macro syntax for "${charm.name}":</p><pre>${e.message}</pre><p>See the console (F12) for details</p>`);
                        console.error(e);
                    }
                    return rollResult;
                });
            }
        }

        const diceRollResults = await this._calculateRoll(dice, rollModifiers);
        this.object.roll = diceRollResults.roll;
        this.object.displayDice = diceRollResults.diceDisplay;
        this.object.total = diceRollResults.total;
        var diceRoll = diceRollResults.diceRoll;

        if (this.object.rollTwice) {
            const secondRoll = await this._calculateRoll(dice, rollModifiers);
            if (secondRoll.total > diceRollResults.total) {
                this.object.roll = secondRoll.roll;
                this.object.displayDice = secondRoll.diceDisplay;
                this.object.total = secondRoll.total;
                diceRoll = secondRoll.diceRoll;
            }
        }
        this.object.roll.dice[0].options.rollOrder = 1;

        let onesRolled = 0;
        let tensRolled = 0;
        for (let dice of diceRoll) {
            if (!dice.rerolled && (dice.result === 1 || (dice.result === 2 && this.object.settings.alsoTriggerTwos))) {
                onesRolled++
            }
            if (!dice.successCanceled && (dice.result === 10 || (dice.result === 9 && this.object.settings.alsoTriggerNines))) {
                tensRolled++;
            }
        }
        if (this.object.settings.triggerOnesCap) {
            onesRolled = Math.min(onesRolled, this.object.settings.triggerOnesCap);
        }
        if (onesRolled > 0 && this.object.settings.triggerOnOnes !== 'none') {
            switch (this.object.settings.triggerOnOnes) {
                case 'soak':
                    this.object.soak += onesRolled;
                    break;
                case 'defense':
                    this.object.defense += onesRolled;
                    break;
                case 'subtractInitiative':
                    if (this.object.characterInitiative) {
                        this.object.characterInitiative -= onesRolled;
                    }
                    break;
                case 'subtractSuccesses':
                    this.object.total -= onesRolled;
                    break;
            }
        }

        if (this.object.settings.triggerTensCap) {
            tensRolled = Math.min(tensRolled, this.object.settings.triggerTensCap);
        }
        if (tensRolled > 0 && this.object.settings.triggerOnTens !== 'none') {
            switch (this.object.settings.triggerOnTens) {
                case 'damage':
                    this.object.damage.damageDice += tensRolled;
                    break;
                case 'postSoakDamage':
                    this.object.damage.postSoakDamage += tensRolled;
                    break;
                case 'extraSuccess':
                    this.object.total += tensRolled;
                    break;
                case 'ignoreHardness':
                    this.object.damage.ignoreHardness += tensRolled;
                    break;
                case 'restoreMote':
                    this.object.restore.motes += tensRolled;
                    break
            }
        }

        if (!this._isAttackRoll() && this.object.rollType !== 'base') {
            await this._updateCharacterResources();
        }
    }

    async _diceRoll() {
        await this._baseAbilityDieRoll();
        let messageContent = `
        <div class="dice-roll">
            <div class="dice-result">
                <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successes} successes
                </h4>
                <div class="dice-tooltip">
                    <div class="dice">
                        <ol class="dice-rolls">${this.object.displayDice}</ol>
                    </div>
                </div>
                <h4 class="dice-total">${this.object.total} Successes</h4>
            </div>
        </div>`;


        messageContent = await this._createChatMessageContent(messageContent, 'Dice Roll');
        ChatMessage.create({ user: game.user.id, speaker: this.actor !== null ? ChatMessage.getSpeaker({ actor: this.actor }) : null, content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: this.object.roll });
    }

    async _abilityRoll() {
        if (this.object.attribute == null) {
            this.object.attribute = this.actor.type === "npc" ? null : this._getHighestAttribute(this.actor.system.attributes);
        }
        if (!this.object.showTargets && this.object.rollType === 'social') {
            this.object.difficulty = Math.max(0, this.object.difficulty + parseInt(this.object.opposedIntimacy || 0) - parseInt(this.object.supportedIntimacy || 0));
        }
        let goalNumberLeft = this.object.goalNumber;
        await this._baseAbilityDieRoll();
        let resultString = ``;
        let extendedTest = ``;

        if (this.object.rollType === "joinBattle") {
            if (game.combat) {
                let combatant = this._getActorCombatant();
                if (!combatant || combatant.initiative === null) {
                    resultString += `<h4 class="dice-total">${this.object.total + 3} Initiative</h4>`;
                }
            }
            else {
                resultString += `<h4 class="dice-total">${this.object.total + 3} Initiative</h4>`;
            }
        }
        if (this.object.rollType === "sorcery") {
            if (this.object.spell) {
                let crashed = false;
                if (game.combat) {
                    let combatant = this._getActorCombatant();
                    if (combatant && combatant?.initiative !== null && combatant.initiative <= 0) {
                        crashed = true;
                    }
                }
                const fullSpell = this.actor.items.get(this.object.spell);
                if (fullSpell) {
                    resultString += `<h4 class="dice-total">Spell Motes: ${this.object.previousSorceryMotes + this.object.total}/${parseInt(fullSpell.system.cost) + (crashed ? 3 : 0)}</h4>`;
                }
                if (this.object.spellCast) {
                    resultString += `<h4 class="dice-total" style="margin-top:5px">Spell Cast</h4>`;
                }
            }
        }
        const threshholdSuccesses = Math.max(0, this.object.total - (this.object.difficulty || 0));
        if (this.object.hasDifficulty) {
            if (this.object.total < this.object.difficulty) {
                resultString = `<h4 class="dice-total dice-total-middle">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">Check Failed</h4>`;
                if (this.object.total === 0 && this.object.roll.dice[0].results.some((die) => die.result === 1)) {
                    resultString = `<h4 class="dice-total dice-total-middle">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">Botch</h4>`;
                }
            }
            else {
                resultString = `<h4 class="dice-total dice-total-middle">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">${threshholdSuccesses} Threshhold Successes</h4>`;
                goalNumberLeft = Math.max(goalNumberLeft - threshholdSuccesses - 1, 0);
                if (this.object.rollType === "simpleCraft") {
                    var craftXPGained = Math.min(this.object.maxCraftXP, threshholdSuccesses + 1);
                    resultString += `<h4 class="dice-total dice-total-end">Craft XP Gained: ${craftXPGained}</h4>`;
                    if (this.object.craftProjectId) {
                        var projectItem = this.actor.items.get(this.object.craftProjectId);
                        var newXp = projectItem.system.experience.completed + craftXPGained;
                        if (projectItem) {
                            if ((newXp) > projectItem.system.experience.required) {
                                resultString += `<h4 class="dice-total dice-total-end">Project Completed</h4>`;
                            }
                            else {
                                resultString += `<h4 class="dice-total dice-total-end">${projectItem.system.experience.required - projectItem.system.experience.completed - craftXPGained} Experience Remaining</h4>`;
                            }
                            projectItem.update({
                                [`system.experience.completed`]: newXp,
                            });
                        }
                    }
                    else {
                        const actorData = duplicate(this.actor);
                        actorData.system.craft.experience.simple.value += craftXPGained;
                        this.actor.update(actorData);
                    }
                }
            }
            if (this.object.goalNumber > 0) {
                extendedTest = `<h4 class="dice-total dice-total-middle" style="margin-top:5px">Goal Number: ${this.object.goalNumber}</h4><h4 class="dice-total">Goal Number Left: ${goalNumberLeft}</h4>`;
            }
            this.object.goalNumber = goalNumberLeft;
            if (this.object.rollType === "grappleControl") {
                const actorData = duplicate(this.actor);
                actorData.system.grapplecontrolrounds.value += threshholdSuccesses;
                this.actor.update(actorData);
            }
            if (this.object.target && this.object.rollType === 'command') {
                if (this.object.target.actor.type === 'npc' && this.object.target.actor.system.battlegroup) {
                    this.object.newTargetData.system.commandbonus.value = threshholdSuccesses;
                    this.object.updateTargetActorData = true;
                }
            }
            if (this.object.rollType === 'steady') {
                this.object.restore.initiative += Math.min(5, threshholdSuccesses);
            }
        }
        let theContent = `
            <div class="dice-roll">
                <div class="dice-result">
                    <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successes} successes</h4>
                    <div class="dice-tooltip">
                        <div class="dice">
                            <ol class="dice-rolls">${this.object.displayDice}</ol>
                        </div>
                    </div>
                    <h4 class="dice-total dice-total-middle">${this.object.total} Successes</h4>
                    ${resultString}
                    ${extendedTest}
                </div>
            </div>`
        let chatCardTitle = 'Ability Roll';
        if (this.object.rollType === 'social') {
            chatCardTitle = `Social action ${this.object.target ? ` on ${this.object.target.name}` : ''}`;
        }
        if (this.object.rollType === 'readIntentions') {
            chatCardTitle = `Read intentions action ${this.object.target ? ` on ${this.object.target.name}` : ''}`;
        }
        theContent = await this._createChatMessageContent(theContent, chatCardTitle)
        ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: theContent,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            roll: this.object.roll,
            flags: {
                "exaltedthird": {
                    dice: this.object.dice,
                    successes: this.object.successes,
                    successModifier: this.object.successModifier,
                    total: this.object.total
                }
            }
        });
        if (this.object.rollType === "joinBattle") {
            let combat = game.combat;
            if (combat) {
                let combatant = this._getActorCombatant();
                if (combatant) {
                    if (combatant.initiative === null) {
                        combat.setInitiative(combatant.id, this.object.total + 3);
                    }
                    else {
                        combat.setInitiative(combatant.id, combatant.initiative + this.object.total);
                    }
                }
            }
        }
        if (this.object.rollType === 'steady') {
            let combat = game.combat;
            if (combat) {
                let combatant = this._getActorCombatant();
                if (combatant && combatant.initiative != null) {
                    combat.setInitiative(combatant.id, combatant.initiative + threshholdSuccesses);
                }
            }
        }
    }

    async _attackRoll() {
        // Accuracy
        if (this.object.rollType !== 'damage') {
            await this._accuracyRoll();
        }
        else {
            this.object.thereshholdSuccesses = 0;
        }
        if ((this.object.thereshholdSuccesses >= 0 && this.object.rollType !== 'accuracy') || this.object.rollType === 'damage') {
            if (this.object.rollType === 'damage' && this.object.attackSuccesses < this.object.defense) {
                this.object.thereshholdSuccesses = this.object.attackSuccesses - this.object.defense;
                await this.missAttack(false);
            }
            else {
                await this._damageRoll();
            }
        }
        else {
            if (this.object.thereshholdSuccesses < 0 && this.object.rollType !== 'accuracy') {
                await this.missAttack();
            }
        }
        if (this.object.rollType === 'accuracy') {
            var messageContent = `
                            <div class="dice-roll">
                                <div class="dice-result">
                                    <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successes} successes</h4>
                                    <div class="dice-tooltip">
                                        <div class="dice">
                                            <ol class="dice-rolls">${this.object.displayDice}</ol>
                                        </div>
                                    </div>
                                    <h4 class="dice-total">${this.object.total} Successes</h4>
                                    ${this.object.target ? `<div><button class="add-oppose-charms"><i class="fas fa-shield-plus"></i> ${game.i18n.localize('Ex3.AddOpposingCharms')}</button></div>` : ''}
                                </div>
                            </div>`;
            messageContent = await this._createChatMessageContent(messageContent, `Accuracy Roll ${this.object.target ? ` vs ${this.object.target.name}` : ''}`);

            ChatMessage.create({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: messageContent,
                type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                roll: this.object.roll,
                flags: {
                    "exaltedthird": {
                        dice: this.object.dice,
                        successes: this.object.successes,
                        successModifier: this.object.successModifier,
                        total: this.object.total,
                        defense: this.object.defense,
                        threshholdSuccesses: this.object.thereshholdSuccesses,
                        targetActorId: this.object.target?.actor?._id,
                        targetTokenId: this.object.target?.id,
                    }
                }
            });
        }
        else {
            this._addAttackEffects();
            this.attackSequence();
        }
    }

    async _postAttackResults() {
        if (this.object.rollType !== 'accuracy' || !this.object.splitAttack) {
            await this._updateCharacterResources();
            if (this.object.targetHit) {
                this.object.gainedInitiative += 1;
            }
            if (this.object.crashed) {
                this.object.gainedInitiative += 5;
            }
            if (game.settings.get("exaltedthird", "automaticWitheringDamage") && this.object.gainedInitiative && this.object.damage.gainInitiative) {
                this.object.characterInitiative += this.object.gainedInitiative;
            }
            const triggerMissedAttack = this.object.missedAttacks > 0 && (this.object.missedAttacks >= this.object.showTargets)
            if (triggerMissedAttack && this.object.attackType !== 'withering' && this.object.damage.resetInit && !game.settings.get("exaltedthird", "forgivingDecisives")) {
                if (this.object.characterInitiative < 11) {
                    this.object.characterInitiative -= 2;
                }
                else {
                    this.object.characterInitiative -= 3;
                }
            }
            if (!triggerMissedAttack && this.object.attackType === 'decisive' && this.object.damage.resetInit) {
                this.object.characterInitiative = this.actor.system.baseinitiative.value;
            }
            if (this.object.attackType === 'gambit') {
                if (this.object.characterInitiative > 0 && (this.object.characterInitiative - this.object.gambitDifficulty - 1 <= 0)) {
                    this.object.characterInitiative -= 5;
                }
                this.object.characterInitiative = this.object.characterInitiative - this.object.gambitDifficulty - 1;
            }
            if (this.object.initiativeShift && this.object.characterInitiative < this.actor.system.baseinitiative.value) {
                this.object.characterInitiative = this.actor.system.baseinitiative.value;
            }
            if (this.actor.type !== 'npc' || this.actor.system.battlegroup === false) {
                let combat = game.combat;
                if (this.object.target && combat) {
                    let combatant = this._getActorCombatant();
                    if (combatant && combatant.initiative != null) {
                        combat.setInitiative(combatant.id, this.object.characterInitiative);
                    }
                }
            }
        }
        if (this.object.splitAttack && this.object.rollType === 'accuracy') {
            this.object.rollType = 'damage';
            this.render();
        }
    }

    async missAttack(accuracyRoll = true) {
        this.object.missedAttacks++;
        if (accuracyRoll) {
            var messageContent = `
            <div class="dice-roll">
                <div class="dice-result">
                    <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successes} successes</h4>
                    <div class="dice-tooltip">
                        <div class="dice">
                            <ol class="dice-rolls">${this.object.displayDice || ''}</ol>
                        </div>
                    </div>
                    <h4 class="dice-formula">${this.object.total || 0} Successes vs ${this.object.defense} Defense</h4>
                    <h4 class="dice-formula">${this.object.thereshholdSuccesses} Threshhold Successes</h4>
                    <h4 class="dice-total">Attack Missed!</h4>
                </div>
            </div>`;
            messageContent = await this._createChatMessageContent(messageContent, 'Attack Roll')
            ChatMessage.create({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: messageContent,
                type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: this.object.roll || undefined,
                flags: {
                    "exaltedthird": {
                        dice: this.object.dice,
                        successes: this.object.successes,
                        successModifier: this.object.successModifier,
                        total: this.object.total || 0,
                        defense: this.object.defense,
                        threshholdSuccesses: this.object.thereshholdSuccesses
                    }
                }
            });
        }
        else {
            var messageContent = `
            <div class="dice-roll">
                <div class="dice-result">
                    <h4 class="dice-formula">${this.object.attackSuccesses} Successes vs ${this.object.defense} Defense</h4>
                    <h4 class="dice-total">Attack Missed!</h4>
                </div>
            </div>`;
            messageContent = await this._createChatMessageContent(messageContent, 'Attack Roll')
            ChatMessage.create({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: messageContent,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            });
        }
    }

    async _failedDecisive(dice) {
        let accuracyContent = '';
        if (this.object.rollType !== 'damage') {
            accuracyContent = `
                <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successes} successes</h4>
                <div class="dice-tooltip">
                    <div class="dice">
                        <ol class="dice-rolls">${this.object.displayDice}</ol>
                    </div>
                </div>
                <h4 class="dice-formula">${this.object.total} Successes vs ${this.object.defense} Defense</h4>
                <h4 class="dice-formula">${this.object.thereshholdSuccesses} Threshhold Successes</h4>
            `
        }
        var messageContent = `
        <div class="dice-roll">
            <div class="dice-result">
                ${accuracyContent}
                <h4 class="dice-formula">${dice} Damage vs ${this.object.hardness} Hardness (Ignoring ${this.object.damage.ignoreHardness})</h4>
                <h4 class="dice-total">Hardness Stopped Decisive!</h4>
            </div>
        </div>`;
        messageContent = await this._createChatMessageContent(messageContent, 'Attack Roll')
        ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: messageContent,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        });
    }

    async _accuracyRoll() {
        await this._baseAbilityDieRoll();
        this.object.thereshholdSuccesses = this.object.total - this.object.defense;
        this.object.attackSuccesses = this.object.total;
        if (this.object.target) {
            this.object.target.rollData.attackSuccesses = this.object.total;
        }
    }

    async _damageRoll() {
        let dice = this.object.damage.damageDice;
        if (this._damageRollType('decisive') && this.object.damage.decisiveDamageType === 'initiative') {
            dice -= this.object.cost.initiative;
            if (this.object.showTargets) {
                if (this.object.damage.decisiveDamageCalculation === 'evenSplit') {
                    dice = Math.ceil(dice / this.object.showTargets);
                }
                else if (this.object.damage.decisiveDamageCalculation === 'half') {
                    dice = Math.ceil(dice / 2);
                }
                else {
                    dice = Math.ceil(dice / 3);
                }
            }
        }
        if (this.object.rollType === 'damage' && (this.object.attackType === 'withering' || this.object.damage.threshholdToDamage)) {
            dice += Math.max(0, this.object.attackSuccesses - this.object.defense);
        }
        else if (this._damageRollType('withering') || this.object.damage.threshholdToDamage) {
            dice += this.object.thereshholdSuccesses;
        }
        if (this.object.targetSpecificDamageMod) {
            dice += this.object.targetSpecificDamageMod;
        }
        var damageResults = ``;
        if (this._damageRollType('decisive')) {
            if (this.object.target) {
                if (this.object.target.actor.type === 'npc' && this.object.target.actor.system.battlegroup) {
                    this.object.damage.damageSuccessModifier += Math.ceil(dice / 4);
                    if (this.object.doubleBGDecisiveDamageBonus) {
                        this.object.damage.damageSuccessModifier += Math.ceil(dice / 4);
                    }
                }
            }
        }
        let baseDamage = dice;
        if (this._damageRollType('withering')) {
            dice -= Math.max(0, this.object.soak - this.object.damage.ignoreSoak);
            if (dice < this.object.overwhelming) {
                dice = Math.max(dice, this.object.overwhelming);
            }
            if (dice < 0) {
                dice = 0;
            }
            dice += this.object.damage.postSoakDamage;
        }
        if (this.object.damage.doublePreRolledDamage) {
            dice *= 2;
        }
        if (dice < 0) {
            dice = 0;
        }
        if (this.object.damage.diceToSuccesses > 0) {
            this.object.damage.damageSuccessModifier += Math.min(dice, this.object.damage.diceToSuccesses);
            dice = Math.max(0, dice - this.object.damage.diceToSuccesses);
        }
        if (this.object.attackType === 'decisive' && dice <= (this.object.hardness - this.object.damage.ignoreHardness)) {
            return this._failedDecisive(dice);
        }
        var rollModifiers = {
            successModifier: this.object.damage.damageSuccessModifier,
            doubleSuccess: this.object.damage.doubleSuccess,
            targetNumber: this.object.damage.targetNumber,
            reroll: this.object.damage.reroll,
            rerollFailed: this.object.damage.rerollFailed,
            rerollNumber: this.object.damage.rerollNumber,
            rerollSuccesses: this.object.damage.rerollSuccesses || 0,
            settings: this.object.settings.damage,
            preRollMacros: [],
            macros: [],
        }

        for (let charm of this.object.addedCharms) {
            if (!charm.system.damagemacro) continue;
            let macro = new Function('rollResult', 'dice', 'diceModifiers', 'doublesRolled', 'numbersRerolled', charm.system.damagemacro);
            rollModifiers.macros.push((rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) => {
                try {
                    this.object.currentMacroCharm = charm;
                    this.object.opposedCharmMacro = false;
                    return macro.call(this, rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) ?? rollResult
                } catch (e) {
                    ui.notifications.error(`<p>There was an error in your macro syntax for "${charm.name}":</p><pre>${e.message}</pre><p>See the console (F12) for details</p>`);
                    console.error(e);
                }
                return rollResult;
            });
        }

        for (let charm of this.object.opposingCharms) {
            if (!charm.system.damagemacro) continue;
            let macro = new Function('rollResult', 'dice', 'diceModifiers', 'doublesRolled', 'numbersRerolled', charm.system.damagemacro);
            rollModifiers.macros.push((rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) => {
                try {
                    this.object.currentMacroCharm = charm;
                    this.object.opposedCharmMacro = true;
                    return macro.call(this, rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) ?? rollResult
                } catch (e) {
                    ui.notifications.error(`<p>There was an error in your macro syntax for "${charm.name}":</p><pre>${e.message}</pre><p>See the console (F12) for details</p>`);
                    console.error(e);
                }
                return rollResult;
            });
        }

        var diceRollResults = await this._calculateRoll(dice, rollModifiers);
        if (this.object.damage.rollTwice) {
            const secondRoll = await this._calculateRoll(dice, rollModifiers);
            if (secondRoll.total > diceRollResults.total) {
                diceRollResults = secondRoll;
            }
        }
        this.object.finalDamageDice = dice;
        diceRollResults.roll.dice[0].options.rollOrder = 1;
        if (this.object.roll) {
            diceRollResults.roll.dice[0].options.rollOrder = 2;
        }
        let total = diceRollResults.total;
        if (this.object.damage.doubleRolledDamage) {
            total *= 2;
        }

        let tensRolled = 0;
        for (let dice of diceRollResults.diceRoll) {
            if (!dice.successCanceled && (dice.result === 10 || (this.object.settings.damage.alsoTriggerNines && dice.result === 9))) {
                tensRolled++;
            }
        }

        if (this.object.settings.damage.triggerTensCap) {
            tensRolled = Math.min(tensRolled, this.object.settings.damage.triggerTensCap);
        }
        if (tensRolled > 0 && this.object.settings.damage.triggerOnTens !== 'none') {
            switch (this.object.settings.damage.triggerOnTens) {
                case 'subtractTargetInitiative':
                    if (this.object.newTargetInitiative) {
                        this.object.updateTargetInitiative = true;
                        this.object.newTargetInitiative--;
                        if ((this.object.newTargetInitiative <= 0 && this.object.targetCombatant.initiative > 0)) {
                            this.object.crashed = true;
                        }
                    }
                    break;
            }
        }
        let soakResult = ``;
        let hardnessResult = ``;
        let typeSpecificResults = ``;
        var sizeDamaged = 0;
        this.object.attackSuccess = true;
        this.object.damageThresholdSuccesses = 0;

        if (this._damageRollType('decisive')) {
            typeSpecificResults = `<h4 class="dice-formula">${dice} Damage vs ${this.object.hardness} Hardness (Ignoring ${this.object.damage.ignoreHardness})</h4><h4 class="dice-total">${total} ${this.object.damage.type.capitalize()} Damage!</h4>`;
            if (this._useLegendarySize('decisive')) {
                typeSpecificResults += `<h4 class="dice-formula">Legendary Size</h4><h4 class="dice-formula">Damage capped at ${3 + this.actor.system.attributes.strength.value + this.object.damage.damageSuccessModifier} + Charm damage levels</h4>`;
                total = Math.min(total, 3 + this.actor.system.attributes.strength.value + this.object.damage.damageSuccessModifier);
            }
            typeSpecificResults += `
            <button
                type='button'
                class='apply-decisive-damage'
                data-tooltip='${game.i18n.localize('Ex3.ApplyDecisiveDamage')}'
                aria-label='${game.i18n.localize('Ex3.ApplyDecisiveDamage')}'
            >
                <i class='fa-solid fa-meter-droplet'></i>
                ${game.i18n.localize('Ex3.ApplyDecisiveDamage')}
            </button>
            `;
            if (game.settings.get("exaltedthird", "automaticDecisiveDamage")) {
                this.dealHealthDamage(total);
            }
            this.object.damageLevelsDealt = total;
        }
        else if (this._damageRollType('gambit')) {
            var resultsText = `<h4 class="dice-total">Gambit Success</h4>`;
            if (this.object.gambitDifficulty > total) {
                this.object.attackSuccess = false;
                resultsText = `<h4 class="dice-total">Gambit Failed</h4>`
            }
            typeSpecificResults = `<h4 class="dice-formula">${total} Successes vs ${this.object.gambitDifficulty} Difficulty!</h4>${resultsText}`;
            this.object.damageThresholdSuccesses = (total - this.object.gambitDifficulty);
        }
        else {
            let targetResults = ``;
            let crashed = false;
            if (this.object.target && game.combat) {
                if (this.object.targetCombatant && this.object.newTargetInitiative !== null) {
                    this.object.targetHit = true;
                    if ((this.object.targetCombatant.actor.type !== 'npc' || this.object.targetCombatant.actor.system.battlegroup === false) && (!this.actor.system.battlegroup || this.object.targetCombatant.initiative > 0)) {
                        let newInitative = this.object.newTargetInitiative;
                        var subractTotal = total;
                        if (game.settings.get("exaltedthird", "automaticWitheringDamage") && this.object.useShieldInitiative && this.object.shieldInitiative > 0) {
                            var newShieldInitiative = Math.max(0, this.object.shieldInitiative - total);
                            this.object.newTargetData.system.shieldinitiative.value = newShieldInitiative;
                            this.object.updateTargetActorData = true;
                            subractTotal = Math.max(0, total - this.object.shieldInitiative);
                        }
                        newInitative -= subractTotal;
                        var attackerCombatant = this._getActorCombatant();
                        if ((newInitative <= 0 && this.object.targetCombatant.initiative > 0)) {
                            if (this._useLegendarySize('withering')) {
                                newInitative = 1;
                            }
                            else {
                                this.object.crashed = true;
                                crashed = true;
                                targetResults = `<h4 class="dice-total" style="margin-top: 5px;">Target Crashed!</h4>`;
                                if (attackerCombatant && this.object.targetCombatant.id === attackerCombatant.flags?.crashedBy) {
                                    this.object.initiativeShift = true
                                    targetResults += '<h4 class="dice-total" style="margin-top: 5px;">Initiative Shift!</h4>';
                                }
                            }
                        }
                        if (game.settings.get("exaltedthird", "automaticWitheringDamage")) {
                            this.object.newTargetInitiative = newInitative;
                            this.object.updateTargetInitiative = true;
                            this.object.gainedInitiative = Math.max(total, this.object.gainedInitiative);
                            if (this.object.damage.maxInitiativeGain) {
                                this.object.gainedInitiative = Math.min(this.object.damage.maxInitiativeGain, this.object.gainedInitiative);
                            }
                        }
                    }
                }
                if (this.object.targetCombatant?.actor?.system?.battlegroup) {
                    if (game.settings.get("exaltedthird", "automaticWitheringDamage")) {
                        sizeDamaged = this.dealHealthDamage(total, true);
                        if (sizeDamaged) {
                            this.object.gainedInitiative += (5 * sizeDamaged);
                        }
                    }
                    else {
                        sizeDamaged = this.calculateSizeDamage(total);
                    }
                    if (sizeDamaged) {
                        targetResults = `<h4 class="dice-total dice-total-middle">${sizeDamaged} Size Damage!</h4>`;
                    }
                }
                this._removeEffect();
            }
            soakResult = `<h4 class="dice-formula">${this.object.soak} Soak! (Ignoring ${this.object.damage.ignoreSoak})</h4><h4 class="dice-formula">${this.object.overwhelming} Overwhelming!</h4>`;
            var fullInitiative = total + 1;
            if (this.object.damage.maxInitiativeGain) {
                fullInitiative = Math.min(this.object.damage.maxInitiativeGain, fullInitiative);
            }
            if (crashed) {
                fullInitiative += 5;
            }
            if (this.object.targetCombatant?.actor?.system?.battlegroup) {
                fullInitiative = (5 * sizeDamaged) + 1;
            }
            if (!game.settings.get("exaltedthird", "automaticWitheringDamage") && this.object.gainedInitiative) {
                fullInitiative += this.object.gainedInitiative;
            }
            typeSpecificResults = `
                                    <h4 class="dice-total dice-total-middle">${total} Total Damage!</h4>
                                    ${this.object.damage.gainInitiative ? `<h4 class="dice-total">${fullInitiative} Initiative Gained!</h4>` : ''}
                                    ${targetResults}
                                    <button
                                        type='button'
                                        class='apply-withering-damage'
                                        data-tooltip='${game.i18n.localize('Ex3.ApplyWitheringDamage')}'
                                        aria-label='${game.i18n.localize('Ex3.ApplyWitheringDamage')}'
                                    >
                                        <i class='fa-solid fa-swords'></i>
                                        ${game.i18n.localize('Ex3.ApplyWitheringDamage')} (${total})
                                    </button>
                                    ${this.object.damage.gainInitiative ? `<button
                                        type='button'
                                        class='gain-attack-initiative'
                                        data-tooltip='${game.i18n.localize('Ex3.GainAttackInitiative')}'
                                        aria-label='${game.i18n.localize('Ex3.GainAttackInitiative')}'
                                    >
                                        <i class='fa-solid fa-arrow-up'></i>
                                        ${game.i18n.localize('Ex3.GainAttackInitiative')} (${fullInitiative})
                                    </button>` : ''}
                                    `;

        }
        var defenseResult = ''
        if (this.object.rollType === 'damage') {
            defenseResult = `<h4 class="dice-formula">${this.object.attackSuccesses} Accuracy Successes vs ${this.object.defense} Defense</h4>`
        }
        damageResults = `
                                <h4 class="dice-total dice-total-middle">${this._damageRollType('gambit') ? 'Gambit' : 'Damage'}</h4>
                                ${defenseResult}
                                <h4 class="dice-formula">${baseDamage} Dice + ${this.object.damage.damageSuccessModifier} successes</h4>
                                ${soakResult}
                                <div class="dice-tooltip">
                                                    <div class="dice">
                                                        <ol class="dice-rolls">${diceRollResults.diceDisplay}</ol>
                                                    </div>
                                                </div>${typeSpecificResults}`;

        var title = "Decisive Attack";
        if (this.object.attackType === 'withering') {
            title = "Withering Attack";
        }
        if (this._damageRollType('gambit')) {
            title = "Gambit";
        }
        var accuracyContent = ``;
        var messageContent = '';
        if (this.object.rollType !== 'damage') {
            accuracyContent = `
                <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successes} successes</h4>
                <div class="dice-tooltip">
                    <div class="dice">
                        <ol class="dice-rolls">${this.object.displayDice}</ol>
                    </div>
                </div>
                <h4 class="dice-formula">${this.object.total} Successes vs ${this.object.defense} Defense</h4>
                <h4 class="dice-formula">${this.object.thereshholdSuccesses} Threshhold Successes</h4>
            `
        }
        else {
            title = 'Damage Roll';
        }

        messageContent = `
                <div class="dice-roll">
                    <div class="dice-result">
                        ${accuracyContent}
                        ${damageResults}
                    </div>
                </div>
          `;

        if (this.object.target) {
            title += ` vs ${this.object.target.actor.name}`
        }


        messageContent = await this._createChatMessageContent(messageContent, title);
        ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: messageContent,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            rolls: this.object.roll ? [this.object.roll, diceRollResults.roll] : [diceRollResults.roll],
            flags: {
                "exaltedthird": {
                    dice: this.object.dice,
                    successes: this.object.successes,
                    successModifier: this.object.successModifier,
                    total: this.object.total,
                    defense: this.object.defense,
                    threshholdSuccesses: this.object.thereshholdSuccesses,
                    attackerTokenId: this.actor.token?.id || this.actor.getActiveTokens()[0]?.id,
                    attackerCombatantId: this._getActorCombatant()?._id || null,
                    targetId: this.object.target?.id || null,
                    damage: {
                        dice: baseDamage,
                        successModifier: this.object.damage.damageSuccessModifier,
                        soak: this.object.soak,
                        total: total,
                        type: this.object.damage.type,
                        crashed: this.object.crashed,
                        targetHit: this.object.targetHit,
                        gainedInitiative: fullInitiative,
                    }
                }
            }
        });

        if (this.actor.system.battlegroup) {
            if (this.object.target && game.combat) {
                if (this.object.targetCombatant && this.object.targetCombatant.initiative != null && this.object.targetCombatant.initiative <= 0) {
                    this.dealHealthDamage(total);
                }
            }
        }
    }

    async _addAttackEffects() {
        if (this.object.triggerSelfDefensePenalty > 0) {
            const existingPenalty = this.actor.effects.find(i => i.flags.exaltedthird?.statusId == "defensePenalty");
            if (existingPenalty) {
                let changes = duplicate(existingPenalty.changes);
                changes[0].value = changes[0].value - this.object.triggerSelfDefensePenalty;
                changes[1].value = changes[1].value - this.object.triggerSelfDefensePenalty;
                existingPenalty.update({ changes });
            }
            else {
                this.actor.createEmbeddedDocuments('ActiveEffect', [{
                    name: 'Defense Penalty',
                    icon: 'systems/exaltedthird/assets/icons/slashed-shield.svg',
                    origin: this.actor.uuid,
                    disabled: false,
                    duration: {
                        rounds: 20,
                        // startRound: game.combat?.round || 0,
                    },
                    flags: {
                        "exaltedthird": {
                            statusId: 'defensePenalty',
                        }
                    },
                    changes: [
                        {
                            "key": "data.evasion.value",
                            "value": (this.object.triggerSelfDefensePenalty * -1),
                            "mode": 2
                        },
                        {
                            "key": "data.parry.value",
                            "value": (this.object.triggerSelfDefensePenalty * -1),
                            "mode": 2
                        }
                    ]
                }]);
            }
        }
        if (this.object.triggerFullDefense) {
            this._addStatusEffect('fulldefense', "addSelfStatuses");
        }
        if (this.object.target) {
            if (game.settings.get("exaltedthird", "calculateOnslaught")) {
                this._addOnslaught(1);
            }
            if (this.object.attackType === 'decisive' && this.object.attackSuccess && this.object.poison && this.object.poison.apply && this.object.poison.damagetype !== 'none') {
                this.object.updateTargetActorData = true;
                this.object.newTargetData.effects.push({
                    name: this.object.poison.name || "Poison",
                    icon: 'icons/skills/toxins/poison-bottle-corked-fire-green.webp',
                    origin: this.actor.uuid,
                    disabled: false,
                    duration: {
                        rounds: this.object.poison.duration,
                        startRound: game.combat?.round || 0,
                    },
                    flags: {
                        "exaltedthird": {
                            poisonerCombatantId: this._getActorCombatant()?._id || null,
                            weaponInflictedPosion: true,
                        }
                    },
                    changes: [
                        {
                            "key": `data.damage.round.${this.object.poison.damagetype}`,
                            "value": this.object.poison.damage,
                            "mode": 0
                        },
                        {
                            "key": `data.dicemodifier.value`,
                            "value": this.object.poison.penalty * -1,
                            "mode": 2
                        },
                    ]
                });
            }
            if (this.object.triggerKnockdown && this.object.thereshholdSuccesses >= 0) {
                this.object.updateTargetActorData = true;
                this._addStatusEffect('prone');
            }
            if (this.object.attackSuccess) {
                this.object.updateTargetActorData = true;
                var triggerGambit = 'none';
                const gambitChart = {
                    'leech': 'bleeding',
                    'unhorse': 'prone',
                    'knockdown': 'prone',
                    'grapple': 'grappled',
                    'disarm': 'disarmed',
                    'entangle': 'entangled',
                }
                if (this.object.gambit !== 'none' && gambitChart[this.object.gambit]) {
                    triggerGambit = gambitChart[this.object.gambit];
                    this._addStatusEffect(triggerGambit);
                }
                if (this.object.gambit === 'leech') {
                    this.dealHealthDamage(1);
                }
                if (this.object.gambit === 'revealWeakness') {
                    this.object.newTargetData.effects.push({
                        name: 'Reveal Weakness',
                        icon: 'systems/exaltedthird/assets/icons/hammer-break.svg',
                        origin: this.object.target.actor.uuid,
                        disabled: false,
                        duration: {
                            rounds: 5,
                        },
                        flags: {
                            "exaltedthird": {
                                statusId: 'revealWeakness',
                            }
                        },
                        changes: [
                            {
                                "key": "data.soak.value",
                                "value": (Math.ceil(this.object.target.actor.system.soak.value / 2)) * -1,
                                "mode": 2
                            }
                        ]
                    });
                }
                if (this.object.gambit === 'pull') {
                    this.object.triggerTargetDefensePenalty += this.object.damageThresholdSuccesses;
                }
                if (this.object.gambit === 'knockback') {
                    this.object.triggerTargetDefensePenalty += this.object.damageThresholdSuccesses;
                }
                if (this.object.gambit === 'grapple') {
                    this._addStatusEffect('grappling', "addSelfStatuses");
                }
                if (this.object.triggerTargetDefensePenalty) {
                    this._addTargetDefensePenalty(this.object.triggerTargetDefensePenalty);
                }
            }
            if (this.object.target.actor.system.grapplecontrolrounds.value > 0) {
                this.object.newTargetData.system.grapplecontrolrounds.value = Math.max(0, this.object.newTargetData.system.grapplecontrolrounds.value - (this.object.thereshholdSuccesses >= 0 ? 2 : 1));
            }
        }
        var actorToken = this._getActorToken();
        for (const status of this.object.addSelfStatuses) {
            const effectExists = this.actor?.effects.find(e => e.statuses.has(status));
            if (!effectExists && actorToken) {
                const effect = CONFIG.statusEffects.find(e => e.id === status);
                await actorToken.toggleEffect(effect);
            }
        }
    }

    async _removeEffect(type = 'revealWeakness') {
        this.object.updateTargetActorData = true;
        const effect = this.object.newTargetData.effects.find(i => i.flags.exaltedthird?.statusId === type);
        if (effect?._id) {
            this.object.deleteEffects.push(effect._id);
        }
        this.object.newTargetData.effects = this.object.newTargetData.effects.filter(i => i.flags.exaltedthird?.statusId !== type);
    }

    _addTriggerBonuses(type = 'beforeRoll') {
        if (!this.object.bonusesTriggered) {
            this.object.bonusesTriggered = {
                beforeRoll: false,
            }
        }
        for (const charm of this.object.addedCharms) {
            this._addBonuses(charm, type, "benefit");
        }
        for (const charm of this.object.opposingCharms) {
            this._addBonuses(charm, type, "opposed");
        }
        this.object.bonusesTriggered[type] = true;
    }

    _addBonuses(charm, type, bonusType = "benefit") {
        const triggerTensMap = {
            damage: 'damage',
            extrasuccess: 'extraSuccess',
            ignorehardness: 'ignoreHardness',
            postsoakdamage: 'postSoakDamage',
            rerollldie: 'rerolllDie',
            restoremote: 'restoreMote',
        }
        const triggerTensDamageMap = {
            subtracttargettnitiative: 'subtractTargetInitiative',
        }
        for (const trigger of Object.values(charm.system.triggers.dicerollertriggers).filter(trigger => trigger.triggerTime === type)) {
            if (this._triggerRequirementsMet(charm, trigger, bonusType)) {
                for (const bonus of Object.values(trigger.bonuses)) {
                    if ((!this.object.bonusesTriggered[type] || ['defense', 'soak', 'hardness', 'guile', 'resolve'].includes(bonus.effect))) {
                        const cleanedValue = bonus.value.toLowerCase().trim();
                        switch (bonus.effect) {
                            case 'diceModifier':
                            case 'successModifier':
                            case 'rerollDice':
                            case 'diceToSuccesses':
                            case 'triggerSelfDefensePenalty':
                            case 'triggerTargetDefensePenalty':
                                this.object[bonus.effect] += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                break;
                            case 'doubleSuccess':
                                this._getDoublesFormula(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                break;
                            case 'decreaseTargetNumber':
                                this.object.targetNumber -= this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                break;
                            case 'rerollDieFace':
                                this._getRerollFormulaCap(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                break;
                            case 'excludeOnes':
                                this.object.settings.excludeOnesFromRerolls = true;
                                break;
                            case 'rerollFailed':
                            case 'rollTwice':
                            case 'activateAura':
                                this.object[bonus.effect] = true;
                                break;
                            case 'triggerOnTens':
                                if (triggerTensMap[cleanedValue]) {
                                    this.object.settings.triggerOnTens = triggerTensMap[cleanedValue];
                                }
                                break;
                            case 'triggerNinesAndTens':
                                if (triggerTensMap[cleanedValue]) {
                                    this.object.settings.triggerOnTens = triggerTensMap[cleanedValue];
                                    this.object.settings.alsoTriggerNines = true;
                                }
                                break;
                            case 'triggerTensCap':
                                this.object.settings.triggerTensCap += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                            case 'reduceDifficulty':
                                if (this.object.showTargets) {
                                    const targetValues = Object.values(this.object.targets);
                                    for (const target of targetValues) {
                                        target.rollData.defense = Math.max(0, target.rollData.defense - this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null));
                                        target.rollData.resolve = Math.max(0, target.rollData.resolve - this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null));
                                        target.rollData.guile = Math.max(0, target.rollData.guile - this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null));
                                    }
                                }
                                else {
                                    this.object.difficulty = Math.max(0, this.object.difficulty - this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null));
                                    this.object.defense = Math.max(0, this.object.defense - this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null));
                                }
                                break;
                            case 'damageDice':
                            case 'damageSuccessModifier':
                                this.object.damage[bonus.effect] += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                break;
                            case 'rerollDice-damage':
                                this.object.damage.rerollDice += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                            case 'diceToSuccesses-damage':
                                this.object.damage.diceToSuccesses += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                break;
                            case 'doubleSuccess-damage':
                                this._getDoublesFormula(cleanedValue, true, bonusType === "opposed" ? charm.actor : null);
                                break;
                            case 'decreaseTargetNumber-damage':
                                this.object.damage.targetNumber -= this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                break;
                            case 'rerollDieFace-damage':
                                this._getRerollFormulaCap(cleanedValue, true, bonusType === "opposed" ? charm.actor : null);
                                break;
                            case 'excludeOnes-damage':
                                this.object.settings.damage.excludeOnesFromRerolls = true;
                                break;
                            case 'rerollFailed-damage':
                                this.object.damage.rerollFailed = true;
                                break;
                            case 'rollTwice-damage':
                                this.object.damage.rollTwice = true;
                                break;
                            case 'triggerOnTens-damage':
                                if (triggerTensDamageMap[cleanedValue]) {
                                    this.object.settings.damage.triggerOnTens = triggerTensDamageMap[cleanedValue];
                                }
                                break;
                            case 'triggerNinesAndTens-damage':
                                if (triggerTensDamageMap[cleanedValue]) {
                                    this.object.settings.damage.triggerOnTens = triggerTensDamageMap[cleanedValue];
                                    this.object.settings.damage.alsoTriggerNines = true;
                                }
                                break;
                            case 'triggerTensCap-damage':
                                this.object.settings.damage.triggerTensCap += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                break;
                            case 'motes-spend':
                            case 'initiative-spend':
                            case 'anima-spend':
                            case 'willpower-spend':
                            case 'penumbra-spend':
                            case 'silverXp-spend':
                            case 'goldXp-spend':
                            case 'whiteXp-spend':
                                const spendKey = bonus.effect.replace('-spend', '');
                                this.object.cost[spendKey] += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                break;
                            case 'muteMotes-spend':
                                this.object.cost.muteMotes += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                break;
                            case 'grappleControl-spend':
                                this.object.cost.grappleControl += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                break;
                            case 'health-spend':
                                this._getHealthFormula(cleanedValue);
                                break;
                            case 'aura-spend':
                                this.object.cost.aura = cleanedValue;
                                break;
                            case 'motes-restore':
                            case 'initiative-restore':
                            case 'anima-restore':
                            case 'willpower-restore':
                                const restoreKey = bonus.effect.replace('-restore', '');
                                this.object.restore[restoreKey] += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                break;
                            case 'ignoreLegendarySize':
                                this.object.settings.ignoreLegendarySize = true;
                                break;
                            case 'defense':
                            case 'soak':
                            case 'hardness':
                            case 'resolve':
                            case 'guile':
                                if (bonus.effect === 'resolve' && bonus.effect === 'guile') {
                                    this.object.difficulty += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);

                                } else {
                                    this.object[bonus.effect] += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                }
                                break;
                            case 'noInitiativeReset':
                                this.object.damage.resetInit = false;
                                break;
                        }
                    }
                }
            }
        }
    }

    _triggerRequirementsMet(charm, trigger, bonusType = "benefit") {
        let fufillsRequirements = true;
        for (const requirementObject of Object.values(trigger.requirements)) {
            const cleanedValue = requirementObject.value.toLowerCase().trim();
            switch (requirementObject.requirement) {
                case 'attackType':
                    if (this.object.attackType !== cleanedValue) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'charmAddedAmount':
                    if (charm.timesAdded < cleanedValue) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'targetIsCrashed':
                    if (this.object.newTargetInitiative === null || this.object.newTargetInitiative > 0) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'crashedTheTarget':
                    if (!this.object.crashed) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'martialArtsLevel':
                    if (charm.actor.system.settings !== cleanedValue) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'smaLevel':
                    if (!charm.actor.system.settings.smaenlightenment) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'formula':
                    if (!this._getBooleanFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null)) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'thresholdSuccesses':
                    if (!this._getBooleanFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null)) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'crashedTheTarget':
                    if (!this._getBooleanFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null)) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'hasStatus':
                    if (!this.actor.effects.some(e => e.statuses.has(cleanedValue))) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'targetHasStatus':
                    if (!this.object.target.actor.effects.some(e => e.statuses.has(cleanedValue))) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'range':
                    if (this.object.range !== cleanedValue) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'damageLevelsDealt':
                    if (this.object.damageLevelsDealt < this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null)) {
                        fufillsRequirements = false;
                    }
                    break;
            }
        }
        return fufillsRequirements;
    }

    _addOnslaught(number = 1, magicInflicted = false) {
        if ((this.object.target?.actor?.system?.sizecategory || 'standard') !== 'legendary' && !magicInflicted) {
            this.object.updateTargetActorData = true;
            const onslaught = this.object.newTargetData.effects.find(i => i.flags.exaltedthird?.statusId === "onslaught");
            if (onslaught) {
                onslaught.changes[0].value = onslaught.changes[0].value - number;
                onslaught.changes[1].value = onslaught.changes[1].value - number;
            }
            else {
                this.object.newTargetData.effects.push({
                    name: game.i18n.localize('Ex3.Onslaught'),
                    icon: 'systems/exaltedthird/assets/icons/surrounded-shield.svg',
                    origin: this.object.target.actor.uuid,
                    disabled: false,
                    duration: {
                        rounds: 5,
                        // startRound: game.combat?.round || 0,
                    },
                    flags: {
                        "exaltedthird": {
                            statusId: 'onslaught',
                        }
                    },
                    changes: [
                        {
                            "key": "data.evasion.value",
                            "value": number * -1,
                            "mode": 2
                        },
                        {
                            "key": "data.parry.value",
                            "value": number * -1,
                            "mode": 2
                        }
                    ]
                });
            }
        }
    }

    _addTargetDefensePenalty(number = 1) {
        this.object.updateTargetActorData = true;
        const existingPenalty = this.object.newTargetData.effects.find(i => i.flags.exaltedthird?.statusId == "defensePenalty");
        if (existingPenalty) {
            existingPenalty.changes[0].value = existingPenalty.changes[0].value - number;
            existingPenalty.changes[1].value = existingPenalty.changes[1].value - number;
        }
        else {
            this.object.newTargetData.effects.push({
                name: game.i18n.localize('Ex3.DefensePenalty'),
                icon: 'systems/exaltedthird/assets/icons/slashed-shield.svg',
                origin: this.object.target.actor.uuid,
                disabled: false,
                duration: {
                    rounds: 5,
                },
                flags: {
                    "exaltedthird": {
                        statusId: 'defensePenalty',
                    }
                },
                changes: [
                    {
                        "key": "data.evasion.value",
                        "value": number * -1,
                        "mode": 2
                    },
                    {
                        "key": "data.parry.value",
                        "value": number * -1,
                        "mode": 2
                    }
                ]
            });
        }
    }

    dealHealthDamage(characterDamage, targetBattlegroup = false) {
        let sizeDamaged = 0;
        if (this.object.target && game.combat && characterDamage > 0) {
            this.object.updateTargetActorData = true;
            let totalHealth = 0;
            if (targetBattlegroup) {
                totalHealth = this.object.newTargetData.system.health.levels.zero.value + this.object.newTargetData.system.size.value;
            }
            else {
                for (let [key, health_level] of Object.entries(this.object.newTargetData.system.health.levels)) {
                    totalHealth += health_level.value;
                }
            }
            if (targetBattlegroup) {
                var remainingHealth = totalHealth - this.object.newTargetData.system.health.bashing - this.object.newTargetData.system.health.lethal - this.object.newTargetData.system.health.aggravated;
                while (remainingHealth <= characterDamage && this.object.newTargetData.system.size.value > 0) {
                    sizeDamaged++;
                    this.object.newTargetData.system.health.bashing = 0;
                    this.object.newTargetData.system.health.lethal = 0;
                    this.object.newTargetData.system.health.aggravated = 0;
                    characterDamage -= remainingHealth;
                    remainingHealth = totalHealth - this.object.newTargetData.system.health.bashing - this.object.newTargetData.system.health.lethal - this.object.newTargetData.system.health.aggravated;
                    this.object.newTargetData.system.size.value -= 1;
                }
            }
            if (this.object.damage.type === 'bashing') {
                this.object.newTargetData.system.health.bashing = Math.min(totalHealth - this.object.newTargetData.system.health.aggravated - this.object.newTargetData.system.health.lethal, this.object.newTargetData.system.health.bashing + characterDamage);
            }
            if (this.object.damage.type === 'lethal') {
                this.object.newTargetData.system.health.lethal = Math.min(totalHealth - this.object.newTargetData.system.health.bashing - this.object.newTargetData.system.health.aggravated, this.object.newTargetData.system.health.lethal + characterDamage);
            }
            if (this.object.damage.type === 'aggravated') {
                this.object.newTargetData.system.health.aggravated = Math.min(totalHealth - this.object.newTargetData.system.health.bashing - this.object.newTargetData.system.health.lethal, this.object.newTargetData.system.health.aggravated + characterDamage);
            }
            if (targetBattlegroup && sizeDamaged) {
                return sizeDamaged;
            }
        }
        return 0;
    }

    calculateSizeDamage(damage) {
        if (this.object.target) {
            let totalHealth = this.object.newTargetData.system.health.levels.zero.value + this.object.newTargetData.system.size.value;
            var currentHealth = totalHealth - this.object.newTargetData.system.health.bashing - this.object.newTargetData.system.health.lethal - this.object.newTargetData.system.health.aggravated;
            const remainingHealth = Math.max(0, currentHealth - damage);
            const totalDamageTaken = totalHealth - remainingHealth;
            const filledHealthBars = Math.ceil(totalDamageTaken / totalHealth);
            return filledHealthBars;
        }
        return 0;
    }

    async _updateTargetActor() {
        if (game.user.isGM) {
            await this.object.target.actor.update(this.object.newTargetData);
            for (const status of this.object.addStatuses) {
                const effectExists = this.object.target.actor.effects.find(e => e.statuses.has(status));
                if (!effectExists) {
                    const effect = CONFIG.statusEffects.find(e => e.id === status);
                    await this.object.target.toggleEffect(effect);
                }
            }
            if (this.object.deleteEffects) {
                await this.object.target.actor.deleteEmbeddedDocuments('ActiveEffect', this.object.deleteEffects);
            }
        }
        else {
            game.socket.emit('system.exaltedthird', {
                type: 'updateTargetData',
                id: this.object.target.id,
                data: this.object.newTargetData,
                addStatuses: this.object.addStatuses,
                deleteEffects: this.object.deleteEffects
            });
        }
    }

    async _updateTargetInitiative() {
        var attackerCombatant = this._getActorCombatant();
        let crasherId = null;
        if (attackerCombatant && this.object.crashed) {
            crasherId = attackerCombatant.id;
        }
        if (game.user.isGM) {
            game.combat.setInitiative(this.object.targetCombatant.id, this.object.newTargetInitiative, crasherId);
        }
        else {
            game.socket.emit('system.exaltedthird', {
                type: 'updateInitiative',
                id: this.object.targetCombatant.id,
                data: this.object.newTargetInitiative,
                crasherId: crasherId,
            });
        }
    }

    async _completeCraftProject() {
        await this._baseAbilityDieRoll();
        let resultString = ``;
        let projectStatus = ``;
        let craftFailed = false;
        let craftSuccess = false;
        let goalNumberLeft = this.object.goalNumber;
        let extendedTest = ``;
        const threshholdSuccesses = Math.max(0, this.object.total - this.object.difficulty);
        if (this.object.goalNumber > 0) {
            extendedTest = `<h4 class="dice-total dice-total-middle">Goal Number: ${this.object.goalNumber}</h4><h4 class="dice-total">Goal Number Left: ${goalNumberLeft}</h4>`;
        }
        if (this.object.total < this.object.difficulty) {
            resultString = `<h4 class="dice-total dice-total-middle">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">Check Failed</h4>${extendedTest}`;
            if (this.object.total === 0 && this.object.roll.dice[0].results.some((die) => die.result === 1)) {
                this.object.finished = true;
                resultString = `<h4 class="dice-total dice-total-middle">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">Botch</h4>`;
                craftFailed = true;
            }
            if (this.object.rollType === 'prophecy') {
                resultString += `<h4 class="dice-total" style="margin-top:5px;">Complication</h4>`;
            }
        }
        else {
            if (this.object.goalNumber > 0) {
                goalNumberLeft = Math.max(this.object.goalNumber - threshholdSuccesses - 1, 0);
                extendedTest = `<h4 class="dice-total dice-total-middle">Goal Number: ${this.object.goalNumber}</h4><h4 class="dice-total">Goal Number Left: ${goalNumberLeft}</h4>`;
                if (goalNumberLeft > 0 && this.object.intervals === 0) {
                    craftFailed = true;
                }
                else if (goalNumberLeft === 0) {
                    craftSuccess = true;
                }
            }
            else {
                craftSuccess = true;
                this.object.finished = true;
            }
            resultString = `<h4 class="dice-total dice-total-middle">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total dice-total-middle">${threshholdSuccesses} Threshhold Successes</h4>${extendedTest}`;
        }
        if (this.object.rollType === 'craft') {
            if (craftFailed) {
                projectStatus = `<h4 class="dice-total">Craft Project Failed</h4>`;
            }
            if (craftSuccess) {
                const actorData = duplicate(this.actor);
                var silverXPGained = 0;
                var goldXPGained = 0;
                var whiteXPGained = 0;
                if (this.object.craftType === 'basic') {
                    if (threshholdSuccesses >= 3) {
                        silverXPGained = 3 * this.object.objectivesCompleted;
                    }
                    else {
                        silverXPGained = 2 * this.object.objectivesCompleted;
                    }
                    projectStatus = `<h4 class="dice-total dice-total-middle">Craft Project Success</h4><h4 class="dice-total">${silverXPGained} Silver XP Gained</h4>`;
                }
                else if (this.object.craftType === "major") {
                    if (threshholdSuccesses >= 3) {
                        silverXPGained = this.object.objectivesCompleted;
                        goldXPGained = 3 * this.object.objectivesCompleted;
                    }
                    else {
                        silverXPGained = this.object.objectivesCompleted;
                        goldXPGained = 2 * this.object.objectivesCompleted;
                    }
                    projectStatus = `<h4 class="dice-total dice-total-middle">Craft Project Success</h4><h4 class="dice-total">${silverXPGained} Silver XP Gained (-10)</h4><h4 class="dice-total">${goldXPGained} Gold XP Gained</h4>`;
                    silverXPGained -= 10;
                }
                else if (this.object.craftType === "superior") {
                    if (this.object.objectivesCompleted > 0) {
                        whiteXPGained = (parseInt(this.object.craftRating) * 2) + 1;
                        goldXPGained = (parseInt(this.object.craftRating) * 2) * this.object.intervals;
                    }
                    projectStatus = `<h4 class="dice-total dice-total-middle">Craft Project Success</h4><h4 class="dice-total">${goldXPGained} Gold XP Gained (-10)</h4><h4 class="dice-total">${whiteXPGained} White XP Gained</h4>`;
                    goldXPGained -= 10;
                }
                else if (this.object.craftType === "legendary") {
                    if (this.object.objectivesCompleted > 0) {
                        whiteXPGained += 10;
                    }
                    projectStatus = `<h4 class="dice-total dice-total-middle">Craft Project Success</h4><h4 class="dice-total">${whiteXPGained} White XP Gained (-10)</h4>`;
                    whiteXPGained -= 10;
                }
                else {
                    projectStatus = `<h4 class="dice-total">Craft Project Success</h4>`;
                }
                actorData.system.craft.experience.silver.value += silverXPGained;
                actorData.system.craft.experience.gold.value += goldXPGained;
                actorData.system.craft.experience.white.value += whiteXPGained;
                this.actor.update(actorData);
            }
        }
        if (this.object.rollType === 'working') {
            if (craftFailed) {
                projectStatus = `<h4 class="dice-total">Working Failed</h4>`;
            }
            if (craftSuccess) {
                projectStatus = `<h4 class="dice-total">Working Success</h4>`;
            }
        }
        if (this.object.rollType === 'prophecy') {
            if (craftFailed) {
                projectStatus += `<h4 class="dice-total">Prophecy Failed</h4>`;
            }
            if (craftSuccess) {
                projectStatus += `<h4 class="dice-total">Prophecy Success</h4>`;
            }
        }


        let messageContent = `
            <div class="dice-roll">
                <div class="dice-result">
                    <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successes} successes</h4>
                    <div class="dice-tooltip">
                        <div class="dice">
                            <ol class="dice-rolls">${this.object.displayDice}</ol>
                        </div>
                    </div>
                    <h4 class="dice-total dice-total-middle">${this.object.total} Successes</h4>
                    ${resultString}
                    ${projectStatus}
                </div>
            </div>
        `

        this.object.finished = craftFailed || craftSuccess;
        messageContent = await this._createChatMessageContent(messageContent, `${this.object.rollType.capitalize()} Roll`);
        ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: messageContent,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            roll: this.object.roll,
            flags: {
                "exaltedthird": {
                    dice: this.object.dice,
                    successes: this.object.successes,
                    successModifier: this.object.successModifier,
                    total: this.object.total
                }
            }
        });
        this.object.goalNumber = goalNumberLeft;
        if (this.object.intervals > 0) {
            this.render();
        }
    }

    _isAttackRoll() {
        return this.object.rollType === 'withering' || this.object.rollType === 'decisive' || this.object.rollType === 'gambit' || this.object.rollType === 'accuracy' || this.object.rollType === 'damage';
    }

    _damageRollType(rollType) {
        return this.object.rollType === rollType || (this.object.rollType === 'damage' && this.object.attackType === rollType);
    }

    _getActorCombatant() {
        if (game.combat && (this.actor.token || this.actor.getActiveTokens()[0])) {
            const tokenId = this.actor.token?.id || this.actor.getActiveTokens()[0]?.id;
            return game.combat.combatants.find(c => c.tokenId === tokenId);
        }
    }

    _getActorToken() {
        if (this.actor.token || this.actor.getActiveTokens()[0]) {
            const tokenId = this.actor.token?.id || this.actor.getActiveTokens()[0]?.id;
            return canvas.tokens.placeables.filter(x => x.id === tokenId)[0];
        }
    }

    _getCraftDifficulty() {
        if (game.settings.get("exaltedthird", "simplifiedCrafting")) {
            this.object.intervals = 1;
        }
        else {
            if (this.object.craftType === 'superior') {
                this.object.intervals = 6;
                this.object.difficulty = 5;
                if (parseInt(this.object.craftRating) === 2) {
                    this.object.goalNumber = 30;
                }
                if (parseInt(this.object.craftRating) === 3) {
                    this.object.goalNumber = 50;
                }
                if (parseInt(this.object.craftRating) === 4) {
                    this.object.goalNumber = 75;
                }
                if (parseInt(this.object.craftRating) === 5) {
                    this.object.goalNumber = 100;
                }
            }
            else if (this.object.craftType === 'legendary') {
                this.object.intervals = 6;
                this.object.difficulty = 5;
                this.object.goalNumber = 200;
            }
        }

    }

    _getRangedAccuracy() {
        var ranges = {
            "bolt-close": 1,
            "bolt-medium": -1,
            "bolt-long": -4,
            "bolt-extreme": -6,

            "ranged-close": -6,
            "ranged-medium": -2,
            "ranged-long": -4,
            "ranged-extreme": -6,

            "thrown-close": 1,
            "thrown-medium": -1,
            "thrown-long": -4,
            "thrown-extreme": -6,

            "siege-close": -2,
            "siege-medium": 7,
            "siege-long": 5,
            "siege-extreme": 3,
        };

        var key = `${this.object.weaponType}-${this.object.range}`;
        var accuracyModifier = ranges[key];
        if (this.object.weaponTags["flame"] && this.object.range === 'close') {
            accuracyModifier += 2;
        }
        return accuracyModifier;
    }

    _useLegendarySize(effectType) {
        if (this.object.settings.ignoreLegendarySize) {
            return false;
        }
        if (this.object.target) {
            if (effectType === 'onslaught') {
                return (this.object.target.actor.system.sizecategory === 'legendary' && this.object.target.actor.system.warstrider.equipped) && this.actor.system.sizecategory !== 'legendary' && !this.actor.system.warstrider.equipped;
            }
            if (effectType === 'withering') {
                return (this.object.target.actor.system.sizecategory === 'legendary' || this.object.target.actor.system.warstrider.equipped) && this.actor.system.sizecategory !== 'legendary' && !this.actor.system.warstrider.equipped && this.object.finalDamageDice < 10;
            }
            if (effectType === 'decisive') {
                return (this.object.target.actor.system.sizecategory === 'legendary' || this.object.target.actor.system.warstrider.equipped) && this.actor.system.sizecategory !== 'legendary' && !this.actor.system.warstrider.equipped;
            }
        }
        return false;
    }

    async _createChatMessageContent(content, cardName = 'Roll') {
        var actionName = '';
        var martialArtName = '';
        var craftRollName = '';
        var abilityName = this.object.ability;
        if (this.object.rollType === 'action') {
            actionName = this.actor.actions.find(x => x._id === this.object.actionId).name;
        }
        var showSpecialAttacks = false
        for (var specialAttack of this.object.specialAttacksList) {
            if (specialAttack.added) {
                showSpecialAttacks = true
            }
        }
        const messageData = {
            name: cardName,
            rollTypeImgUrl: CONFIG.exaltedthird.rollTypeTargetImages[this.object.rollType] || CONFIG.exaltedthird.rollTypeTargetImages[this.object.attackType] || CONFIG.exaltedthird.rollTypeTargetImages[this.object.ability] || "systems/exaltedthird/assets/icons/d10.svg",
            rollTypeLabel: CONFIG.exaltedthird.rollTypeTargetLabels[this.object.rollType] || CONFIG.exaltedthird.rollTypeTargetLabels[this.object.ability] || "Ex3.Roll",
            messageContent: content,
            rollData: this.object,
            isAttack: this._isAttackRoll(),
            actionName: actionName,
            abilityName: abilityName,
            showSpecialAttacks: showSpecialAttacks,
            rollingActor: this.actor,
        }
        return await renderTemplate("systems/exaltedthird/templates/chat/roll-card.html", messageData);
    }

    _getDiceCap() {
        if (this.object.rollType !== "base") {
            if (this.actor.type === "character" && this.actor.system.attributes[this.object.attribute]) {
                if (this.actor.system.attributes[this.object.attribute].excellency || this.actor.system.abilities[this.object.ability]?.excellency || this.object.customabilities.some(ma => ma._id === this.object.ability && ma.system.excellency)) {
                    if (this.object.rollType === 'damage') {
                        if (this.actor.system.details.exalt === "lunar") {
                            return `${this.actor.system.attributes['strength'].value} - ${this.actor.system.attributes['strength'].value + 5}`;
                        }
                        else {
                            return '';
                        }
                    }
                    var abilityValue = 0;
                    abilityValue = this._getCharacterAbilityValue(this.actor, this.object.ability);
                    if (['abyssal', 'solar', 'infernal'].includes(this.actor.system.details.exalt)) {
                        return abilityValue + this.actor.system.attributes[this.object.attribute].value;
                    }
                    if (this.actor.system.details.exalt === "dragonblooded") {
                        return abilityValue + (this.object.specialty ? 1 : 0);
                    }
                    if (this.actor.system.details.exalt === "lunar") {
                        return `${this.actor.system.attributes[this.object.attribute].value} - ${this.actor.system.attributes[this.object.attribute].value + this._getHighestAttributeNumber(this.actor.system.attributes, true)}`;
                    }
                    if (this.actor.system.details.exalt === "sidereal") {
                        var baseSidCap = Math.min(5, Math.max(3, this.actor.system.essence.value));
                        var tnChange = "";
                        if (abilityValue === 5) {
                            if (this.actor.system.essence.value >= 3) {
                                tnChange = " - TN -3";
                            }
                            else {
                                tnChange = " - TN -2";
                            }
                        }
                        else if (abilityValue >= 3) {
                            tnChange = " - TN -1";
                        }
                        return `${baseSidCap}${tnChange}`;
                    }
                    if (this.actor.system.details.exalt === "dreamsouled") {
                        return `${abilityValue} or ${Math.min(10, abilityValue + this.actor.system.essence.value)} when upholding ideal`;
                    }
                    if (this.actor.system.details.exalt === "umbral") {
                        return `${Math.min(10, abilityValue + this.actor.system.penumbra.value)}`;
                    }
                    if (this.actor.system.details.exalt === "hearteater") {
                        return `${this.actor.system.attributes[this.object.attribute].value + 1} + Intimacy`;
                    }
                    if (this.actor.system.details.exalt === "liminal") {
                        if (this.actor.system.anima.value >= 1) {
                            return `${this.actor.system.attributes[this.object.attribute].value + this.actor.system.essence.value}`;
                        }
                        else {
                            return `${this.actor.system.attributes[this.object.attribute].value}`;
                        }
                    }
                    if (this.actor.system.details.caste.toLowerCase() === "architect") {
                        return `${this.actor.system.attributes[this.object.attribute].value} or ${this.actor.system.attributes[this.object.attribute].value + this.actor.system.essence.value} in cities`;
                    }
                    if (this.actor.system.details.caste.toLowerCase() === "janest" || this.actor.system.details.caste.toLowerCase() === 'strawmaiden') {
                        return `${this.actor.system.attributes[this.object.attribute].value} + [Relevant of Athletics, Awareness, Presence, Resistance, or Survival]`;
                    }
                    if (this.actor.system.details.exalt === "sovereign") {
                        return Math.min(Math.max(this.actor.system.essence.value, 3) + this.actor.system.anima.value, 10);
                    }
                }
            }
            else if (this.actor.system.lunarform?.enabled) {
                const lunar = game.actors.get(this.actor.system.lunarform.actorid);
                let diceCap = 'Connected Lunar could not be found';
                if (lunar) {
                    let lunarPool = 0;
                    let animalPool = 0;
                    let lunarAttributeValue = 0;
                    let lunarHasExcellency = false;
                    const action = this.object.actions.find(action => action._id === this.object.pool);
                    if (lunar.type === 'npc') {
                        if (action) {
                            const lunarAction = lunar.items.filter(item => item.type === 'action').find(lunarActionItem => lunarActionItem.name === action.name);
                            if (lunarAction) {
                                lunarPool = lunarAction.system.value;
                            }
                        }
                        else if (this._isAttackRoll()) {
                            lunarPool = 0;
                        }
                        else {
                            lunarPool = lunar.system.pools[this.object.pool].value;
                        }
                    }
                    else {
                        if (action) {
                            lunarPool = (lunar.system.attributes[action.system.lunarstats.attribute]?.value || 0) + this._getCharacterAbilityValue(lunar, action.system.lunarstats.ability);
                            lunarAttributeValue = lunar.system.attributes[action.system.lunarstats.attribute]?.value;
                            lunarHasExcellency = lunar.system.attributes[action.system.lunarstats.attribute]?.excellency;
                        }
                        else if (this._isAttackRoll()) {
                            lunarPool = lunar.system.attributes[lunar.system.settings.rollsettings.attacks.attribute]?.value + this._getCharacterAbilityValue(lunar, 'brawl');
                            lunarAttributeValue = lunar.system.attributes[lunar.system.settings.rollsettings.attacks.attribute]?.value;
                            lunarHasExcellency = lunar.system.attributes[lunar.system.settings.rollsettings.attacks.attribute]?.excellency;
                        }
                        else if (this.object.pool === 'grapple') {
                            lunarPool = lunar.system.attributes[lunar.system.settings.rollsettings.grapplecontrol.attribute]?.value + this._getCharacterAbilityValue(lunar, lunar.system.settings.rollsettings.grapplecontrol.ability);
                            lunarAttributeValue = lunar.system.attributes[lunar.system.settings.rollsettings.grapplecontrol.attribute]?.value;
                            lunarHasExcellency = lunar.system.attributes[lunar.system.settings.rollsettings.grapplecontrol.attribute]?.excellency;
                        }
                        else if (this.object.rollType === 'disengage') {
                            lunarPool = lunar.system.attributes[lunar.system.settings.rollsettings.disengage.attribute]?.value + this._getCharacterAbilityValue(lunar, lunar.system.settings.rollsettings.disengage.ability);
                            lunarAttributeValue = lunar.system.attributes[lunar.system.settings.rollsettings.disengage.attribute]?.value;
                            lunarHasExcellency = lunar.system.attributes[lunar.system.settings.rollsettings.disengage.attribute]?.excellency;
                        }
                        else if (this.object.pool === 'movement') {
                            lunarPool = lunar.system.attributes[lunar.system.settings.rollsettings.rush.attribute]?.value + this._getCharacterAbilityValue(lunar, lunar.system.settings.rollsettings.rush.ability);
                            lunarAttributeValue = lunar.system.attributes[lunar.system.settings.rollsettings.rush.attribute]?.value;
                            lunarHasExcellency = lunar.system.attributes[lunar.system.settings.rollsettings.rush.attribute]?.excellency;
                        }
                        else {
                            lunarPool = lunar.system.attributes[lunar.system.settings.rollsettings[this.object.pool].attribute]?.value + this._getCharacterAbilityValue(lunar, lunar.system.settings.rollsettings[this.object.pool].ability);
                            lunarAttributeValue = lunar.system.attributes[lunar.system.settings.rollsettings[this.object.pool].attribute]?.value;
                            lunarHasExcellency = lunar.system.attributes[lunar.system.settings.rollsettings[this.object.pool].attribute]?.excellency;
                        }
                        if (this.object.specialty) {
                            lunarPool++;
                        }
                    }
                    if (this.object.actions.some(action => action._id === this.object.pool)) {
                        animalPool = this.actor.actions.find(x => x._id === this.object.pool).system.value;
                    }
                    else if (this._isAttackRoll()) {
                        animalPool = this.object.weaponAccuracy || 0;
                    }
                    else {
                        animalPool = this.actor.system.pools[this.object.pool].value;
                    }
                    let currentCharmDice = 0;
                    for (const charm of this.object.addedCharms) {
                        if (charm.system.diceroller.settings.noncharmdice) {
                            currentCharmDice += this._getFormulaValue(charm.system.diceroller.bonusdice);
                        }
                        if (charm.system.diceroller.settings.noncharmsuccesses) {
                            currentCharmDice += (this._getFormulaValue(charm.system.diceroller.bonussuccesses) * 2);
                        }
                    }
                    this.object.charmDiceAdded = Math.max(currentCharmDice, currentCharmDice + (animalPool - lunarPool));
                    if (lunarHasExcellency) {
                        diceCap = `${lunarAttributeValue} - ${lunarAttributeValue + this._getHighestAttributeNumber(lunar.system.attributes, true)}`;
                    }
                    else {
                        diceCap = '';
                    }
                }
                return diceCap;
            }
            else if (this.actor.type === "npc" && this.actor.system.creaturetype === 'exalt') {
                var dicePool = 0;
                if (this.object.actions && this.object.actions.some(action => action._id === this.object.pool)) {
                    dicePool = this.actor.actions.find(x => x._id === this.object.pool).system.value;
                }
                else if (this.actor.system.pools[this.object.pool]) {
                    if (this.object.baseAccuracy) {
                        dicePool = this.object.baseAccuracy;
                    } else {
                        dicePool = this.actor.system.pools[this.object.pool].value;
                    }
                }
                var diceTier = "zero";
                var diceMap = {
                    'zero': 0,
                    'two': 2,
                    'three': 3,
                    'seven': 7,
                    'eleven': 11,
                };
                if (dicePool <= 2) {
                    diceTier = "two";
                }
                else if (dicePool <= 6) {
                    diceTier = "three";
                }
                else if (dicePool <= 10) {
                    diceTier = "seven";
                }
                else {
                    diceTier = "eleven";
                }
                if (this.actor.system.details.exalt === "sidereal") {
                    return this.actor.system.essence.value;
                }
                if (['abyssal', 'solar', 'infernal', 'alchemical'].includes(this.actor.system.details.exalt)) {
                    diceMap = {
                        'zero': 0,
                        'two': 2,
                        'three': 5,
                        'seven': 7,
                        'eleven': 10,
                    };
                }
                if (this.actor.system.details.exalt === 'getimian') {
                    diceMap = {
                        'zero': 0,
                        'two': 2,
                        'three': 5,
                        'seven': 6,
                        'eleven': 10,
                    };
                }
                if (this.actor.system.details.exalt === "dragonblooded") {
                    diceMap = {
                        'zero': 0,
                        'two': 0,
                        'three': 2,
                        'seven': 4,
                        'eleven': 6,
                    };
                }
                if (this.actor.system.details.exalt === "lunar") {
                    diceMap = {
                        'zero': 0,
                        'two': 1,
                        'three': 2,
                        'seven': 4,
                        'eleven': 5,
                    };
                    if (diceTier === 'two') {
                        return 1;
                    }
                    return `${diceMap[diceTier]}, ${diceTier === 'seven' ? (diceMap[diceTier] * 2) - 1 : diceMap[diceTier] * 2}`;
                }
                if (this.actor.system.details.exalt === "liminal") {
                    diceMap = {
                        'zero': 0,
                        'two': 1,
                        'three': 2,
                        'seven': 4,
                        'eleven': 5,
                    };
                }
                return diceMap[diceTier];
            }
        }
        return "";
    }

    _getCharacterAbilityValue(actor, ability) {
        if (actor.items.filter(item => item.type === 'customability').some(ca => ca._id === ability)) {
            return actor.customabilities.find(x => x._id === ability).system.points;
        }
        if (actor.system.abilities[ability]) {
            return actor.system.abilities[ability]?.value || 0;
        }
        if (ability === 'willpower') {
            return actor.system.willpower.max;
        }
        return 0;
    }

    _getDamageCap() {
        if (this._isAttackRoll() && this.object.attackType === 'withering') {
            let actorData = this.actor;
            if (this.actor.system.lunarform?.enabled && this.actor.system.lunarform?.actorid) {
                actorData = game.actors.get(this.actor.system.lunarform.actorid) || actorData;
            }
            if (actorData.type === 'character' && actorData.system.attributes.strength.excellency) {
                var newValueLow = Math.floor(actorData.system.attributes.strength.value / 2);
                var newValueHigh = Math.floor((actorData.system.attributes.strength.value + this._getHighestAttributeNumber(actorData.system.attributes)) / 2);
                return `(+${newValueLow}-${newValueHigh} for ${newValueLow}-${newValueHigh}m)`;
            }
        }
        return '';
    }

    _setBattlegroupBonuses() {
        this.object.diceModifier += this.actor.system.commandbonus.value;
        if (this._isAttackRoll()) {
            this.object.diceModifier += (this.actor.system.size.value + this.actor.system.might.value);
            if (this._damageRollType('withering')) {
                this.object.damage.damageDice += (this.actor.system.size.value + this.actor.system.might.value);
            }
        }
    }

    _getHighestAttribute(attributes, syncedLunar = false) {
        var highestAttributeNumber = 0;
        var highestAttribute = "strength";
        for (let [name, attribute] of Object.entries(attributes)) {
            if (attribute.value > highestAttributeNumber && (!syncedLunar || name !== this.object.attribute)) {
                highestAttributeNumber = attribute.value;
                highestAttribute = name;
            }
        }
        return highestAttribute;
    }


    _getHighestAttributeNumber(attributes, syncedLunar = false) {
        var highestAttributeNumber = 0;
        var highestAttribute = "strength";
        for (let [name, attribute] of Object.entries(attributes)) {
            if (attribute.value > highestAttributeNumber && (!syncedLunar || name !== this.object.attribute)) {
                highestAttributeNumber = attribute.value;
                highestAttribute = name;
            }
        }
        return highestAttributeNumber;
    }

    _calculateAnimaGain() {
        var newLevel = this.actor.system.anima.level;
        if (this.object.cost.anima > 0) {
            for (var i = 0; i < this.object.cost.anima; i++) {
                if (newLevel === "Transcendent") {
                    newLevel = "Bonfire";
                }
                else if (newLevel === "Bonfire") {
                    newLevel = "Burning";
                }
                else if (newLevel === "Burning") {
                    newLevel = "Glowing";
                }
                if (newLevel === "Glowing") {
                    newLevel = "Dim";
                }
            }
        }

        if (this.object.motePool === 'peripheral') {
            if (this.object.cost.motes > 4) {
                for (var i = 0; i < Math.floor((this.object.cost.motes) / 5); i++) {
                    if (newLevel === "Dim") {
                        newLevel = "Glowing";
                    }
                    else if (newLevel === "Glowing") {
                        newLevel = "Burning";
                    }
                    else if (newLevel === "Burning") {
                        newLevel = "Bonfire";
                    }
                    else if (this.actor.system.anima.max === 4) {
                        newLevel = "Transcendent";
                    }
                }
            }
        }

        this.object.newAnima = newLevel;
    }

    _migrateNewData(data) {
        if (this.object.cost === undefined) {
            this.object.cost = {
                motes: 0,
                muteMotes: 0,
                willpower: 0,
                initiative: 0,
                anima: 0,
                healthbashing: 0,
                healthlethal: 0,
                healthaggravated: 0,
                grappleControl: 0,
                silverxp: 0,
                goldxp: 0,
                whitexp: 0,
                aura: "",
            }
        }
        if (this.object.cost.grapplecontrol === undefined) {
            this.object.cost.grapplecontrol = 0;
        }
        if (this.object.restore === undefined) {
            this.object.restore = {
                motes: 0,
                willpower: 0,
                health: 0,
                initiative: 0
            };
        }
        if (this.object.damage.type === undefined) {
            this.object.damage.type = 'lethal';
        }
        if (this.object.craft === undefined) {
            this.object.craft = {
                divineInsperationTechnique: false,
                holisticMiracleUnderstanding: false,
            }
        }
        if (this.object.triggers === undefined) {
            this.object.triggers = [];
        }
        if (this.object.damage.threshholdToDamage === undefined) {
            this.object.damage.threshholdToDamage = false;
        }
        if (this.object.weaponTags === undefined) {
            this.object.weaponTags = {};
        }
        if (this.object.damage.resetInit === undefined) {
            this.object.damage.resetInit = true;
        }
        if (this.object.damage.doubleRolledDamage === undefined) {
            this.object.damage.doubleRolledDamage = false;
        }
        if (this.object.damage.maxInitiative === undefined) {
            this.object.damage.maxInitiative = 0;
        }
        if (this.object.damage.ignoreSoak === undefined) {
            this.object.damage.ignoreSoak = 0;
            this.object.triggerSelfDefensePenalty = 0;
            this.object.triggerKnockdown = false;
        }
        if (this.object.triggerTargetDefensePenalty === undefined) {
            this.object.triggerTargetDefensePenalty = 0;
        }
        if (this.object.damage.ignoreHardness === undefined) {
            this.object.damage.ignoreHardness = 0;
        }
        if (this.object.damage.gainInitiative === undefined) {
            this.object.damage.gainInitiative = true;
        }
        if (this.object.addedCharms === undefined) {
            this.object.addedCharms = [];
        }
        if (this.object.opposingCharms === undefined) {
            this.object.opposingCharms = [];
        }
        if (this.object.damage.decisiveDamageType === undefined) {
            this.object.damage.decisiveDamageType = 'initiative';
            this.object.damage.decisiveDamageCalculation = 'evenSplit';
            this.object.gambit = 'none';
        }
        if (this.object.addStatuses === undefined) {
            this.object.addStatuses = [];
        }
        if (this.object.addSelfStatuses === undefined) {
            this.object.addSelfStatuses = [];
        }
        else {
            for (const addedCharm of this.object.addedCharms) {
                if (!addedCharm.timesAdded) {
                    addedCharm.timesAdded = 1;
                }
                if (addedCharm.saveId) {
                    addedCharm.id = addedCharm.saveId;
                }
                else {
                    var actorItem = this.actor.items.find((item) => item.name == addedCharm.name && item.type == 'charm');
                    if (actorItem) {
                        addedCharm.id = actorItem.id;
                    }
                }
            }
        }
        if (this.object.settings === undefined) {
            this.object.settings = {
                doubleSucccessCaps: {
                    sevens: 0,
                    eights: 0,
                    nines: 0,
                    tens: 0
                },
                excludeOnesFromRerolls: false,
                triggerOnOnes: 'none',
                triggerOnesCap: 0,
                triggerOnTens: 'none',
                triggerTensCap: 0,
                damage: {
                    doubleSucccessCaps: {
                        sevens: 0,
                        eights: 0,
                        nines: 0,
                        tens: 0
                    },
                    excludeOnesFromRerolls: false,
                    triggerOnTens: 'none',
                    alsoTriggerNines: false,
                    triggerTensCap: 0,
                }
            }
            this.object.damage.rerollNumber = 0;
            this.object.damage.rerollFailed = false;
            this.object.damage.rollTwice = false;
            this.object.damage.triggerOnTens = 'none';
            this.object.damage.triggerTensCap = 'none';
            this.object.activateAura = 'none';
            for (var rerollValue in this.object.reroll) {
                this.object.reroll[rerollValue].cap = 0;
            }
            for (var rerollValue in this.object.damage.reroll) {
                this.object.damage.reroll[rerollValue].cap = 0;
            }
        }
        if (this.object.settings.triggerOnTens === undefined) {
            this.object.settings.triggerOnTens = 'none';
        }
        if (this.object.settings.ignoreLegendarySize === undefined) {
            this.object.settings.ignoreLegendarySize = false;
        }
        if (this.object.specialAttacksList === undefined) {
            this.object.specialAttacksList = [
                { id: 'aim', name: "Aim", added: false, show: false, description: '+3 Attack Dice', img: 'systems/exaltedthird/assets/icons/targeting.svg' },
                { id: 'chopping', name: "Chopping", added: false, show: false, description: 'Cost: 1i and reduce defense by 1. Increase damage by 3 on withering.  -2 hardness on decisive', img: 'systems/exaltedthird/assets/icons/battered-axe.svg' },
                { id: 'flurry', name: "Flurry", added: false, show: this._isAttackRoll(), description: 'Cost: 3 dice and reduce defense by 1.', img: 'systems/exaltedthird/assets/icons/spinning-blades.svg' },
                { id: 'fulldefense', name: "Flurry Full Defense", added: false, show: false, description: '3 Dice and 2 Initiative cost and add the full defense effect to token.  -1 Defense for flurrying', img: 'icons/svg/shield.svg' },
                { id: 'piercing', name: "Piercing", added: false, show: false, description: 'Cost: 1i and reduce defense by 1.  Ignore 4 soak', img: 'systems/exaltedthird/assets/icons/fast-arrow.svg' },
                { id: 'knockdown', name: "Smashing (Knockdown)", added: false, show: false, description: 'Cost: 2i and reduce defense by 1. Knock opponent down', img: 'icons/svg/falling.svg' },
                { id: 'knockback', name: "Smashing (Knockback)", added: false, show: false, description: 'Cost: 2i and reduce defense by 1.  Knock opponent back 1 range band', img: 'systems/exaltedthird/assets/icons/hammer-drop.svg' },
                { id: 'impale', name: "Impale", added: false, show: false, description: 'If moved 2 consecutive range bands toward target while mounted.  Deal +5 withering or +3 decisive damage', img: 'systems/exaltedthird/assets/icons/spiked-tail.svg' },
            ];
        }
        if (this.object.charmDiceAdded === undefined) {
            this.object.charmDiceAdded = 0;
        }
        if (this.object.diceCap === undefined) {
            this.object.diceCap = this._getDiceCap();
        }
        if (this.object.damageDiceCap === undefined) {
            this.object.damageDiceCap = this._getDamageCap();
        }
        if (this.object.diceToSuccesses === undefined) {
            this.object.diceToSuccesses = 0;
        }
        if (this.object.damage.diceToSuccesses === undefined) {
            this.object.damage.diceToSuccesses = 0;
        }
        if (this.object.rollTwice === undefined) {
            this.object.rollTwice = false;
        }
        if (this.object.attackEffect === undefined) {
            this.object.attackEffectPreset = data.attackEffectPreset || 'none';
            this.object.attackEffect = data.attackEffect || '';
        }
        if (this.object.applyAppearance === undefined) {
            this.object.applyAppearance = false;
            this.object.appearanceBonus = 0;
        }
        if (this.object.hardness === undefined) {
            this.object.hardness = 0;
        }
        if (this.object.shieldInitiative === undefined) {
            this.object.shieldInitiative = 0;
        }
        if (this.object.spell === undefined) {
            this.object.spell = "";
        }
        if (this.object.rollType !== 'base' && this.actor.type === 'npc' && !this.actor.system.pools[this.object.pool]) {
            const findPool = this.actor.actions.find((action) => action.system.oldKey === this.object.pool);
            if (findPool) {
                this.object.pool = findPool._id;
                this.object.actions = this.actor.actions;
            }
        }
    }

    async _updateCharacterResources() {
        if (this.object.rollType === 'sorcery') {
            this.object.previousSorceryMotes = this.actor.system.sorcery.motes.value;
            let actorSorceryMotes = this.actor.system.sorcery.motes.value;
            let actorSorceryMoteCap = this.actor.system.sorcery.motes.max;
            let crashed = false;
            if (game.combat) {
                let combatant = this._getActorCombatant();
                if (combatant && combatant?.initiative !== null && combatant.initiative <= 0) {
                    crashed = true;
                }
            }
            actorSorceryMotes += this.object.total;
            if (this.object.spell) {
                const activeSpell = this.actor.items?.find(item => item.system?.shaping);
                if (activeSpell && activeSpell.id !== this.object.spell) {
                    actorSorceryMotes = this.object.total;
                    actorSorceryMoteCap = 0;
                    this.object.previousSorceryMotes = 0;
                }
                for (const spell of this.actor.items.filter(spell => spell.type === 'spell')) {
                    if (spell.id === this.object.spell) {
                        await spell.update({ [`system.shaping`]: true });
                        actorSorceryMoteCap = (parseInt(spell.system.cost) + (crashed ? 3 : 0));
                    }
                    if (spell.system.shaping && spell.id !== this.object.spell) {
                        await spell.update({ [`system.shaping`]: false });
                    }
                }
                if (actorSorceryMoteCap && (actorSorceryMotes >= actorSorceryMoteCap)) {
                    this.object.spellCast = true;
                    actorSorceryMotes = 0;
                    actorSorceryMoteCap = 0;
                    if (this.object.spell && !crashed) {
                        this.object.restore.willpower++;
                    }
                    for (const spell of this.actor.items.filter(spell => spell.type === 'spell')) {
                        await spell.update({ [`system.shaping`]: false });
                    }
                }
            }
            await this.actor.update({
                [`system.sorcery.motes.value`]: actorSorceryMotes,
                [`system.sorcery.motes.max`]: actorSorceryMoteCap
            });
        }
        const actorData = duplicate(this.actor);
        var newLevel = actorData.system.anima.level;
        var newValue = actorData.system.anima.value;
        if (this.object.cost.anima > 0) {
            for (var i = 0; i < this.object.cost.anima; i++) {
                if (newLevel === "Transcendent") {
                    newLevel = "Bonfire";
                    newValue = 3;
                }
                else if (newLevel === "Bonfire") {
                    newLevel = "Burning";
                    newValue = 2;
                }
                else if (newLevel === "Burning") {
                    newLevel = "Glowing";
                    newValue = 1;
                }
                if (newLevel === "Glowing") {
                    newLevel = "Dim";
                    newValue = 0;
                }
            }
        }
        var spentPersonal = 0;
        var spentPeripheral = 0;
        var totalMotes = this.object.cost.motes + this.object.cost.muteMotes;
        if (this.object.motePool === 'personal') {
            var remainingPersonal = actorData.system.motes.personal.value - totalMotes;
            if (remainingPersonal < 0) {
                spentPersonal = totalMotes + remainingPersonal;
                spentPeripheral = Math.min(actorData.system.motes.peripheral.value, Math.abs(remainingPersonal));
            }
            else {
                spentPersonal = totalMotes;
            }
        }
        else {
            var remainingPeripheral = actorData.system.motes.peripheral.value - totalMotes;
            if (remainingPeripheral < 0) {
                spentPeripheral = totalMotes + remainingPeripheral;
                spentPersonal = Math.min(actorData.system.motes.personal.value, Math.abs(remainingPeripheral));
            }
            else {
                spentPeripheral = totalMotes;
            }
        }
        actorData.system.penumbra.value = Math.max(0, actorData.system.penumbra.value - this.object.cost.penumbra);
        actorData.system.motes.peripheral.value = Math.max(0, actorData.system.motes.peripheral.value - spentPeripheral);
        actorData.system.motes.personal.value = Math.max(0, actorData.system.motes.personal.value - spentPersonal);

        if ((spentPeripheral - this.object.cost.muteMotes) > 4) {
            for (var i = 0; i < Math.floor((spentPeripheral - this.object.cost.muteMotes) / 5); i++) {
                if (newLevel === "Dim") {
                    newLevel = "Glowing";
                    newValue = 1;
                }
                else if (newLevel === "Glowing") {
                    newLevel = "Burning";
                    newValue = 2;
                }
                else if (newLevel === "Burning") {
                    newLevel = "Bonfire";
                    newValue = 3;
                }
                else if (actorData.system.anima.max === 4) {
                    newLevel = "Transcendent";
                    newValue = 4;
                }
            }
        }

        actorData.system.anima.level = newLevel;
        actorData.system.anima.value = newValue;

        actorData.system.willpower.value = Math.max(0, actorData.system.willpower.value - this.object.cost.willpower);
        actorData.system.grapplecontrolrounds.value = Math.max(0, actorData.system.grapplecontrolrounds.value - this.object.cost.grappleControl);

        if (this.actor.type === 'character') {
            actorData.system.craft.experience.silver.value = Math.max(0, actorData.system.craft.experience.silver.value - this.object.cost.silverxp);
            actorData.system.craft.experience.gold.value = Math.max(0, actorData.system.craft.experience.gold.value - this.object.cost.goldxp);
            actorData.system.craft.experience.white.value = Math.max(0, actorData.system.craft.experience.white.value - this.object.cost.whitexp);
        }
        if (actorData.system.details.aura === this.object.cost.aura || this.object.cost.aura === 'any') {
            actorData.system.details.aura = "none";
        }
        let totalHealth = 0;
        for (let [key, health_level] of Object.entries(actorData.system.health.levels)) {
            totalHealth += health_level.value;
        }
        if (this.object.cost.healthbashing > 0) {
            actorData.system.health.bashing = Math.min(totalHealth - actorData.system.health.aggravated - actorData.system.health.lethal, actorData.system.health.bashing + this.object.cost.healthbashing);
        }
        if (this.object.cost.healthlethal > 0) {
            actorData.system.health.lethal = Math.min(totalHealth - actorData.system.health.bashing - actorData.system.health.aggravated, actorData.system.health.lethal + this.object.cost.healthlethal);
        }
        if (this.object.cost.healthaggravated > 0) {
            actorData.system.health.aggravated = Math.min(totalHealth - actorData.system.health.bashing - actorData.system.health.lethal, actorData.system.health.aggravated + this.object.cost.healthaggravated);
        }
        if (this.actor.system.anima.value !== newValue) {
            animaTokenMagic(this.actor, newValue);
        }
        if (this.object.activateAura !== 'none') {
            actorData.system.details.aura = this.object.activateAura;
        }
        if (this.object.motePool === 'personal') {
            actorData.system.motes.personal.value = Math.min(actorData.system.motes.personal.max, actorData.system.motes.personal.value + this.object.restore.motes);
        }
        else {
            actorData.system.motes.peripheral.value = Math.min(actorData.system.motes.peripheral.max, actorData.system.motes.peripheral.value + this.object.restore.motes);
        }
        actorData.system.willpower.value = Math.min(actorData.system.willpower.max, actorData.system.willpower.value + this.object.restore.willpower);
        if (this.object.restore.health > 0) {
            const bashingHealed = this.object.restore.health - actorData.system.health.lethal;
            actorData.system.health.lethal = Math.max(0, actorData.system.health.lethal - this.object.restore.health);
            if (bashingHealed > 0) {
                actorData.system.health.bashing = Math.max(0, actorData.system.health.bashing - bashingHealed);
            }
        }
        if (this.object.stunt === 'bank') {
            actorData.system.stuntdice.value += 2;
        }
        if (game.combat) {
            let combatant = this._getActorCombatant();
            if (combatant) {
                if (this.object.characterInitiative === undefined) {
                    this.object.characterInitiative = combatant.initiative;
                }
                if (this.object.cost.initiative > 0) {
                    this.object.characterInitiative -= this.object.cost.initiative;
                    if (combatant.initiative > 0 && this.object.characterInitiative <= 0) {
                        this.object.characterInitiative -= 5;
                    }
                }
                if (this.object.restore.initiative > 0) {
                    this.object.characterInitiative += this.object.restore.initiative;
                }
                game.combat.setInitiative(combatant.id, this.object.characterInitiative);
            }
        }
        this.actor.update(actorData);
    }

    _addStatusEffect(name, statusType = "addStatuses", value = 0) {
        switch (name) {
            default:
                this.object[statusType].push(name);
        }
    }

    attackSequence() {
        const actorToken = this._getActorToken();
        if (this.object.target && actorToken && game.settings.get("exaltedthird", "attackEffects")) {
            if (this.object.attackEffectPreset !== 'none') {
                let effectsMap = {
                    'arrow': 'jb2a.arrow.physical.white.01.05ft',
                    'bite': 'jb2a.bite.400px.red',
                    'brawl': 'jb2a.flurry_of_blows.physical.blue',
                    'claws': 'jb2a.claws.400px.red',
                    'fireball': 'jb2a.fireball.beam.orange',
                    'firebreath': 'jb2a.breath_weapons.fire.line.orange',
                    'flamepiece': 'jb2a.bullet.01.orange.05ft',
                    'glaive': 'jb2a.glaive.melee.01.white.5',
                    'goremaul': 'jb2a.maul.melee.standard.white',
                    'greatsaxe': 'jb2a.greataxe.melee.standard.white',
                    'greatsword': 'jb2a.greatsword.melee.standard.white',
                    'handaxe': 'jb2a.handaxe.melee.standard.white',
                    'lightning': 'jb2a.chain_lightning.primary.blue.05ft',
                    'quarterstaff': 'jb2a.quarterstaff.melee.01.white.3',
                    'rapier': 'jb2a.rapier.melee.01.white.4',
                    'scimitar': 'jb2a.scimitar.melee.01.white.0',
                    'shortsword': 'jb2a.shortsword.melee.01.white.0',
                    'spear': 'jb2a.spear.melee.01.white.2',
                    'sword': 'jb2a.sword.melee.01.white.4',
                    'throwdagger': 'jb2a.dagger.throw.01.white.15ft',
                }

                switch (this.object.attackEffectPreset) {
                    case 'fireball':
                        new Sequence()
                            // .effect()
                            // .file('animated-spell-effects-cartoon.fire.118')
                            // .atLocation(actorToken)
                            // .delay(300)
                            .effect()
                            .file(effectsMap[this.object.attackEffectPreset])
                            .atLocation(actorToken)
                            .stretchTo(this.object.target)
                            .effect()
                            .file("jb2a.fireball.explosion.orange")
                            .atLocation(this.object.target)
                            .delay(2100)
                            .effect()
                            .file("jb2a.ground_cracks.orange.01")
                            .atLocation(this.object.target)
                            .belowTokens()
                            .scaleIn(0.5, 150, { ease: "easeOutExpo" })
                            .duration(5000)
                            .fadeOut(3250, { ease: "easeInSine" })
                            .name("Fireball_Impact")
                            .delay(2300)
                            .waitUntilFinished(-3250)
                            .effect()
                            .file("jb2a.impact.ground_crack.still_frame.01")
                            .atLocation(this.object.target)
                            .belowTokens()
                            .fadeIn(300, { ease: "easeInSine" })
                            .play();
                        break;
                    case 'flamepiece':
                        new Sequence()
                            .effect()
                            .file(effectsMap[this.object.attackEffectPreset])
                            .atLocation(actorToken)
                            .stretchTo(this.object.target)
                            .waitUntilFinished(-500)
                            .effect()
                            .file("jb2a.impact.010.orange")
                            .atLocation(this.object.target)
                            .play()
                        break;
                    case 'goremaul':
                        new Sequence()
                            .effect()
                            .file(effectsMap[this.object.attackEffectPreset])
                            .atLocation(actorToken)
                            .stretchTo(this.object.target)
                            .waitUntilFinished(-1100)
                            .effect()
                            .file("jb2a.impact.ground_crack.orange")
                            .atLocation(this.object.target)
                            .scale(0.5)
                            .belowTokens()
                            .play();
                        break;
                    case 'none':
                        break;
                    default:
                        new Sequence()
                            .effect()
                            .file(effectsMap[this.object.attackEffectPreset])
                            .atLocation(actorToken)
                            .stretchTo(this.object.target)
                            .play()
                        break;
                }
            }
            else if (this.object.attackEffect) {
                new Sequence()
                    .effect()
                    .file(this.object.attackEffect)
                    .atLocation(actorToken)
                    .stretchTo(this.object.target)
                    .play()
            }
        }
        if (this.object.weaponMacro) {
            let macro = new Function(this.object.weaponMacro);
            try {
                macro.call(this);
            } catch (e) {
                ui.notifications.error(`<p>There was an error in your macro syntax for the weapon macro:</p><pre>${e.message}</pre><p>See the console (F12) for details</p>`);
                console.error(e);
            }
        }
    }
}

export async function animaTokenMagic(actor, newAnimaValue) {
    const tokenId = actor.token?.id || actor.getActiveTokens()[0]?.id;
    const actorToken = canvas.tokens.placeables.filter(x => x.id === tokenId)[0];
    if (game.settings.get("exaltedthird", "animaTokenMagic") && actorToken) {
        let effectColor = Number(`0x${actor.system.details.animacolor.replace('#', '')}`);
        let sovereign =
            [{
                filterType: "xfire",
                filterId: "myChromaticXFire",
                time: 0,
                blend: 2,
                amplitude: 1.1,
                dispersion: 0,
                chromatic: true,
                scaleX: 1,
                scaleY: 1,
                inlay: false,
                animated:
                {
                    time:
                    {
                        active: true,
                        speed: -0.0015,
                        animType: "move"
                    }
                }
            }];

        let glowing =
            [{
                filterType: "glow",
                filterId: "superSpookyGlow",
                outerStrength: 4,
                innerStrength: 0,
                color: effectColor,
                quality: 0.5,
                padding: 10,
                animated:
                {
                    color:
                    {
                        active: true,
                        loopDuration: 3000,
                        animType: "colorOscillation",
                        val1: 0xFFFFFF,
                        val2: effectColor
                    }
                }
            }];
        let burning =
            [
                {
                    filterType: "zapshadow",
                    filterId: "myPureFireShadow",
                    alphaTolerance: 0.50
                },
                {
                    filterType: "xglow",
                    filterId: "myPureFireAura",
                    auraType: 2,
                    color: effectColor,
                    thickness: 9.8,
                    scale: 4.,
                    time: 0,
                    auraIntensity: 2,
                    subAuraIntensity: 1.5,
                    threshold: 0.40,
                    discard: true,
                    animated:
                    {
                        time:
                        {
                            active: true,
                            speed: 0.0027,
                            animType: "move"
                        },
                        thickness:
                        {
                            active: true,
                            loopDuration: 3000,
                            animType: "cosOscillation",
                            val1: 2,
                            val2: 5
                        }
                    }
                }];

        let bonfire =
            [{
                filterType: "zapshadow",
                filterId: "myZap",
                alphaTolerance: 0.45
            }, {
                filterType: "field",
                filterId: "myLavaRing",
                shieldType: 6,
                gridPadding: 1.25,
                color: effectColor,
                time: 0,
                blend: 14,
                intensity: 1,
                lightAlpha: 0,
                lightSize: 0.7,
                scale: 1,
                radius: 1,
                chromatic: false,
                discardThreshold: 0.30,
                hideRadius: 0.95,
                alphaDiscard: true,
                animated:
                {
                    time:
                    {
                        active: true,
                        speed: 0.0015,
                        animType: "move"
                    },
                    radius:
                    {
                        active: true,
                        loopDuration: 6000,
                        animType: "cosOscillation",
                        val1: 1,
                        val2: 0.8
                    },
                    hideRadius:
                    {
                        active: true,
                        loopDuration: 3000,
                        animType: "cosOscillation",
                        val1: 0.75,
                        val2: 0.4
                    }
                }
            }, {
                filterType: "xglow",
                filterId: "myBurningAura",
                auraType: 2,
                color: effectColor,
                thickness: 9.8,
                scale: 1.,
                time: 0,
                auraIntensity: 2,
                subAuraIntensity: 1,
                threshold: 0.30,
                discard: true,
                zOrder: 3000,
                animated:
                {
                    time:
                    {
                        active: true,
                        speed: 0.0027,
                        animType: "move"
                    },
                    thickness:
                    {
                        active: true,
                        loopDuration: 600,
                        animType: "cosOscillation",
                        val1: 4,
                        val2: 8
                    }
                }
            }];

        if (actorToken) {
            await TokenMagic.deleteFilters(actorToken);
            if (newAnimaValue > 0) {
                if (newAnimaValue === 1) {
                    await TokenMagic.addUpdateFilters(actorToken, glowing);
                }
                else if (newAnimaValue === 2) {
                    await TokenMagic.addUpdateFilters(actorToken, burning);
                    if (actorToken.actor.system.details.exalt === "sovereign") {
                        await TokenMagic.addUpdateFilters(actorToken, sovereign);
                    }
                }
                else {
                    await TokenMagic.addUpdateFilters(actorToken, bonfire);
                    if (actorToken.actor.system.details.exalt === "sovereign") {
                        await TokenMagic.addUpdateFilters(actorToken, sovereign);
                    }
                }
            }
        }
    }
}

export class Prophecy extends FormApplication {
    constructor(actor, options, object, data) {
        super(object, options);
        this.actor = actor;
        this.object.sign = '';
        this.object.signTrappings = '';
        this.object.maxAmbition = Math.max(3, this.actor.system.essence.value);
        this.object.maxTotalAmbition = (this.actor.system.essence.value * 2) + 5;
        this.object.signList = CONFIG.exaltedthird.siderealSigns;
        this.object.totalUsedAmbition = 4;
        this.object.ambitions = {
            duration: {
                label: 'Ex3.Duration',
                value: 1,
                text: 'One month',
            },
            frequency: {
                label: 'Ex3.Frequency',
                value: 1,
                text: 'Once per story',
            },
            power: {
                label: 'Ex3.Power',
                value: 1,
                text: 'Effects only mortals and trivial characters.',
            },
            scope: {
                label: 'Ex3.Scope',
                value: 1,
                text: 'Up to 10 people/Household',
            }
        }
        this.object.means = {
            cooperation: {
                label: 'Ex3.Cooperation',
                value: 0,
                text: 'No Cooperation',
            },
            cosignatories: {
                label: 'Ex3.Cosignatories',
                value: 0,
                text: 'No Cosignatories',
            },
            intervalTime: {
                label: 'Ex3.IntervalTime',
                value: 0,
            },

        }
        this.object.trappings = {
            label: 'Ex3.Trappings',
            value: false,
        }
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`],
            popOut: true,
            template: "systems/exaltedthird/templates/dialogues/prophecy.html",
            id: "prophecy",
            title: `Prophecy`,
            resizable: true,
            width: 400,
            submitOnChange: true,
            closeOnSubmit: false
        });
    }

    getData() {
        return {
            data: this.object,
        };
    }

    async _updateObject(event, formData) {
        mergeObject(this, formData);
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find("#roll").on("click", async (event) => {
            let bonusIntervals = 0;
            for (const mean of Object.values(this.object.means)) {
                bonusIntervals += parseInt(mean.value);
            }
            if (this.object.trappings.value) {
                bonusIntervals += 1;
            }

            const intervalTime = {
                "0": "One Week",
                "1": "One Month",
                "2": "Three Months",
            };

            const sign = `The ${this.object.sign.capitalize()}`;

            let intervalTimeString = intervalTime[this.object.means.intervalTime.value];

            const cardContent = await renderTemplate("systems/exaltedthird/templates/chat/prophecy-card.html", { 'data': this.object, intervalTimeString: intervalTimeString, sign: sign });

            ChatMessage.create({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: cardContent,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            });
            game.rollForm = new RollForm(this.actor, {}, {}, { rollType: 'prophecy', prophecyAmbition: this.object.totalUsedAmbition, bonusIntervals: bonusIntervals }).render(true);
            this.close();
        });

        html.on("change", ".ambition-rerender", ev => {
            const valueMap = {
                duration: {
                    1: 'One month',
                    2: 'One season',
                    3: 'One year',
                    4: 'Ten years',
                    5: 'One hundred years',
                },
                frequency: {
                    1: 'Once per story',
                    2: 'Once per week',
                    3: 'Once per day',
                    4: 'Once per scene',
                    5: 'No limit',
                },
                power: {
                    1: 'Effects only mortals and trivial characters',
                    2: 'Can affect non-exalts with Essence 1',
                    3: 'Can affect un-exalted characters with essence 3 or less',
                    4: 'Can affect any character with less or equal to Sidereal\'s (Essence or 3)',
                    5: 'All characters',
                },
                scope: {
                    1: 'Up to 10 people/Household',
                    2: 'Up to 25 people/Hamlet',
                    3: 'Up to 100 people/Village',
                    4: 'Up to 1,000 people/Town or City neightborhood',
                    5: 'Up to 10,000 people/small city, large city district',
                },
            }
            let prophecyAmbition = 0;
            for (const ambition of Object.values(this.object.ambitions)) {
                prophecyAmbition += parseInt(ambition.value);
            }
            this.object.totalUsedAmbition = prophecyAmbition;
            this.object.ambitions[ev.target.id].text = valueMap[ev.target.id][ev.target.value];
            this.render();
        });

        html.on("change", ".means-rerender", ev => {
            const valueMap = {
                cooperation: {
                    0: 'No Cooperation',
                    1: 'Another sidereal or a god with thematically related powers.',
                    2: 'More than a single circle of sidereals',
                },
                cosignatories: {
                    0: 'No Cosignatory',
                    1: 'Another sidereal or Bureau god',
                    2: 'An Essence 6+ god or sidereal',
                },
            }
            this.object.means[ev.target.id].text = valueMap[ev.target.id][ev.target.value];
            this.render();
        });

        html.on("change", ".sign-select", ev => {
            this.object.maxAmbition = Math.max(3, this.actor.system.essence.value);
            this.object.maxTotalAmbition = (this.actor.system.essence.value * 2) + 5;
            if (ev.target.value === this.actor.system.details.exaltsign || ev.target.value === this.actor.system.details.birthsign) {
                this.object.maxAmbition++;
                this.object.maxTotalAmbition += 5;
            }
            this.render();
        });
    }
}