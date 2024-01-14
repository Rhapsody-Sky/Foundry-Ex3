import TraitSelector from "../apps/trait-selector.js";
import { animaTokenMagic, Prophecy, RollForm } from "../apps/dice-roller.js";
import { onManageActiveEffect, prepareActiveEffectCategories } from "../effects.js";
import Importer from "../apps/importer.js";
import { prepareItemTraits } from "../item/item.js";
import { addDefensePenalty, subtractDefensePenalty, spendEmbeddedItem } from "./actor.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class ExaltedThirdActorSheet extends ActorSheet {

  constructor(...args) {
    super(...args);

    this._filters = {
      effects: new Set()
    }
    if (this.object.type === "character") {
      this.options.width = this.position.width = game.settings.get("exaltedthird", "compactSheets") ? 560 : 800;
      this.options.height = this.position.height = game.settings.get("exaltedthird", "compactSheets") ? 620 : 1061;
    }
    if (this.object.type === "npc") {
      this.position.width = this.position.width = game.settings.get("exaltedthird", "compactSheetsNPC") ? 560 : 800;
      this.position.height = this.position.height = game.settings.get("exaltedthird", "compactSheetsNPC") ? 620 : 1061;
    }
    this.options.classes = [...this.options.classes, this.getTypeSpecificCSSClasses()];
  }

  /**
 * Get the correct HTML template path to use for rendering this particular sheet
 * @type {String}
 */
  get template() {
    if (this.actor.type === "npc") return "systems/exaltedthird/templates/actor/npc-sheet.html";
    return "systems/exaltedthird/templates/actor/actor-sheet.html";
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["exaltedthird", "sheet", "actor"],
      template: "systems/exaltedthird/templates/actor/actor-sheet.html",
      width: 800,
      height: 1061,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
    });
  }

  getTypeSpecificCSSClasses() {
    if (this.actor.system.settings.sheetbackground === 'default') {
      return `${game.settings.get("exaltedthird", "sheetStyle")}-background`;
    }
    return `${this.actor.system.settings.sheetbackground}-background`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const context = await super.getData();
    context.dtypes = ["String", "Number", "Boolean"];

    const actorData = this.actor.toObject(false);
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.biographyHTML = await TextEditor.enrichHTML(context.system.biography, {
      secrets: this.document.isOwner,
      async: true
    });
    context.attributeList = CONFIG.exaltedthird.attributes;
    context.abilityList = JSON.parse(JSON.stringify(CONFIG.exaltedthird.abilities));
    context.rollData = context.actor.getRollData();
    context.showFullAttackButtons = game.settings.get("exaltedthird", "showFullAttacks");
    context.showVirtues = game.settings.get("exaltedthird", "virtues");
    context.unifiedCharacterCreation = game.settings.get("exaltedthird", "unifiedCharacterCreation");
    context.bankableStunts = game.settings.get("exaltedthird", "bankableStunts");
    context.useShieldInitiative = game.settings.get("exaltedthird", "useShieldInitiative");
    context.availableCastes = []
    context.availableCastes = CONFIG.exaltedthird.castes[context.system.details.exalt];
    context.characterLunars = game.actors.filter(actor => actor.system.details.exalt === 'lunar' && actor.id !== context.actor.id).map((actor) => {
      return {
        id: actor.id,
        label: actor.name
      }
    });
    this._prepareTraits(context.system.traits);
    // this._prepareActorSheetData(context);
    this._prepareCharacterItems(context);
    if (context.actor.type === 'character') {
      this._prepareCharacterData(context);
    }
    if (context.actor.type === 'npc') {
      this._prepareNPCData(context);
    }
    context.itemDescriptions = {};
    for (let item of this.actor.items) {
      context.itemDescriptions[item.id] = await TextEditor.enrichHTML(item.system.description, { async: true, secrets: this.actor.isOwner, relativeTo: item });
    }

    context.effects = prepareActiveEffectCategories(this.document.effects);
    return context;
  }

  // _prepareActorSheetData(sheetData) {
  //   const actorData = sheetData.actor;
  // }

  _prepareCharacterData(sheetData) {
    const actorData = sheetData.actor;

    var pointsAvailableMap = {
      primary: 8,
      secondary: 6,
      tertiary: 4,
    }
    var attributesSpent = {
      physical: {
        favored: 0,
        unFavored: 0,
      },
      mental: {
        favored: 0,
        unFavored: 0,
      },
      social: {
        favored: 0,
        unFavored: 0,
      }
    }
    if (sheetData.system.details.exalt === 'lunar') {
      pointsAvailableMap = {
        primary: 9,
        secondary: 7,
        tertiary: 5,
      }
    }
    if (sheetData.system.details.exalt === 'mortal') {
      pointsAvailableMap = {
        primary: 6,
        secondary: 4,
        tertiary: 3,
      }
    }
    sheetData.system.charcreation.available = {
      attributes: {
        physical: pointsAvailableMap[sheetData.system.charcreation.physical],
        social: pointsAvailableMap[sheetData.system.charcreation.social],
        mental: pointsAvailableMap[sheetData.system.charcreation.mental],
      },
      abilities: 28,
      bonuspoints: 15,
      experience: 55,
      charms: 15,
      specialties: 4,
      merits: 10,
      intimacies: 4,
      willpower: 5,
    }
    if (sheetData.system.details.exalt === 'solar' || sheetData.system.details.exalt === 'lunar') {
      if (sheetData.system.essence.value >= 2) {
        sheetData.system.charcreation.available.charms = 20;
        sheetData.system.charcreation.available.merits = 13;
        sheetData.system.charcreation.available.bonuspoints = 18;
      }
    }
    if (sheetData.system.details.exalt === 'lunar') {
      if (sheetData.system.essence.value >= 2) {
        sheetData.system.charcreation.available.charms = 20;
        sheetData.system.charcreation.available.merits = 13;
        sheetData.system.charcreation.available.bonuspoints = 18;
      }
    }
    if (sheetData.system.details.exalt === 'dragonblooded') {
      sheetData.system.charcreation.available = {
        attributes: {
          physical: pointsAvailableMap[sheetData.system.charcreation.physical],
          social: pointsAvailableMap[sheetData.system.charcreation.social],
          mental: pointsAvailableMap[sheetData.system.charcreation.mental],
        },
        abilities: 28,
        bonuspoints: 18,
        experience: 55,
        charms: 20,
        specialties: 3,
        merits: 18,
        intimacies: 4,
        willpower: 5,
      }
      if (sheetData.system.essence.value === 1) {
        sheetData.system.charcreation.available.specialties = 3;
        sheetData.system.charcreation.available.charms = 15;
        sheetData.system.charcreation.available.merits = 10;
        sheetData.system.charcreation.available.bonuspoints = 15;
      }
    }
    if (sheetData.system.details.exalt === 'sidereal') {
      if (sheetData.system.essence.value >= 2) {
        sheetData.system.charcreation.available.charms = 20;
        sheetData.system.charcreation.available.merits = 13;
        sheetData.system.charcreation.available.bonuspoints = 18;
      }
    }
    if (sheetData.system.details.exalt === 'mortal') {
      sheetData.system.charcreation.available = {
        attributes: {
          physical: pointsAvailableMap[sheetData.system.charcreation.physical],
          social: pointsAvailableMap[sheetData.system.charcreation.social],
          mental: pointsAvailableMap[sheetData.system.charcreation.mental],
        },
        abilities: 28,
        bonuspoints: 21,
        experience: 55,
        charms: 0,
        specialties: 4,
        merits: 7,
        intimacies: 4,
        willpower: 3,
      }
    }
    sheetData.system.charcreation.spent = {
      attributes: {
        physical: 0,
        social: 0,
        mental: 0,
      },
      abilities: 0,
      bonuspoints: 0,
      experience: 0,
      charms: 0,
      specialties: 0,
      merits: 0,
      abovethree: 0,
      intimacies: 0,
    }
    for (let [key, attr] of Object.entries(sheetData.system.attributes)) {
      attr.isCheckbox = attr.dtype === "Boolean";
      sheetData.system.charcreation.spent.attributes[attr.type] += (attr.value - 1);
      if (attr.favored) {
        attributesSpent[attr.type].favored += (attr.value - 1);
      }
      else {
        attributesSpent[attr.type].unFavored += (attr.value - 1);
      }
    }
    var favoredCharms = 0;
    var nonFavoredCharms = 0;
    var favoredAttributesSpent = 0;
    var unFavoredAttributesSpent = 0;
    var tertiaryAttributes = 0;
    var nonTertiaryAttributes = 0;
    var threeOrBelowFavored = 0;
    var threeOrBelowNonFavored = 0;
    var aboveThreeFavored = 0;
    var aboveThreeUnFavored = 0;

    for (let [key, attribute] of Object.entries(sheetData.system.charcreation.spent.attributes)) {
      if (sheetData.system.charcreation[key] === 'tertiary') {
        tertiaryAttributes += Math.max(0, sheetData.system.charcreation.spent.attributes[key] - sheetData.system.charcreation.available.attributes[key]);
      }
      else {
        nonTertiaryAttributes += Math.max(0, sheetData.system.charcreation.spent.attributes[key] - sheetData.system.charcreation.available.attributes[key]);
      }
      unFavoredAttributesSpent += Math.max(0, attributesSpent[key].unFavored - sheetData.system.charcreation.available.attributes[key]);
      favoredAttributesSpent += Math.max(0, attributesSpent[key].favored - Math.max(0, sheetData.system.charcreation.available.attributes[key] - attributesSpent[key].unFavored));
    }
    for (let [key, ability] of Object.entries(sheetData.system.abilities)) {
      sheetData.system.charcreation.spent.abovethree += Math.max(0, (ability.value - 3));
      if (ability.favored) {
        aboveThreeFavored += Math.max(0, (ability.value - 3));
        sheetData.system.charcreation.spent.bonuspoints += Math.max(0, (ability.value - 3));
        threeOrBelowFavored += Math.min(3, ability.value);
      }
      else {
        sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (ability.value - 3))) * 2;
        threeOrBelowNonFavored += Math.min(3, ability.value);
        aboveThreeUnFavored += Math.max(0, (ability.value - 3));
      }
    }
    for (let customAbility of actorData.customabilities) {
      sheetData.system.charcreation.spent.abovethree += Math.max(0, (customAbility.system.points - 3));
      if (customAbility.system.favored) {
        sheetData.system.charcreation.spent.bonuspoints += Math.max(0, (customAbility.system.points - 3));
        threeOrBelowFavored += Math.min(3, customAbility.system.points);
        aboveThreeFavored += Math.max(0, (customAbility.system.points - 3));
      }
      else {
        sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (customAbility.system.points - 3))) * 2;
        threeOrBelowNonFavored += Math.min(3, customAbility.system.points);
        aboveThreeUnFavored += Math.max(0, (customAbility.system.points - 3));
      }
    }
    sheetData.system.charcreation.spent.abilities = threeOrBelowFavored + threeOrBelowNonFavored;
    var nonfavoredBPBelowThree = Math.max(0, (threeOrBelowNonFavored - 28));
    var favoredBPBelowThree = Math.max(0, (threeOrBelowFavored - Math.max(0, 28 - threeOrBelowNonFavored)));
    if (sheetData.system.details.exalt === 'lunar') {
      sheetData.system.charcreation.spent.bonuspoints += (favoredAttributesSpent * 3) + (unFavoredAttributesSpent * 4);
    } else {
      sheetData.system.charcreation.spent.bonuspoints += (tertiaryAttributes * 3) + (nonTertiaryAttributes * 4);
    }
    for (let merit of actorData.merits) {
      sheetData.system.charcreation.spent.merits += merit.system.points;
    }

    for (const charm of actorData.items.filter((item) => item.type === 'charm')) {
      if (actorData.system.attributes[charm.system.ability] && actorData.system.attributes[charm.system.ability].favored) {
        favoredCharms++;
      } else if (actorData.system.abilities[charm.system.ability] && actorData.system.abilities[charm.system.ability].favored) {
        favoredCharms++;
      }
      else {
        nonFavoredCharms++;
      }
    }

    if (actorData.system.abilities.occult.favored) {
      favoredCharms += Math.max(0, actorData.items.filter((item) => item.type === 'spell').length - 1);
    }
    else {
      nonFavoredCharms += Math.max(0, actorData.items.filter((item) => item.type === 'spell').length - 1);
    }

    var totalNonFavoredCharms = Math.max(0, (nonFavoredCharms - sheetData.system.charcreation.available.charms));
    var totalFavoredCharms = Math.max(0, (favoredCharms - Math.max(0, sheetData.system.charcreation.available.charms - nonFavoredCharms)));

    sheetData.system.charcreation.spent.charms = nonFavoredCharms + favoredCharms;
    sheetData.system.charcreation.spent.bonuspoints += favoredBPBelowThree + (nonfavoredBPBelowThree * 2);
    sheetData.system.charcreation.spent.intimacies = actorData.items.filter((item) => item.type === 'intimacy').length;
    sheetData.system.charcreation.spent.bonuspoints += totalNonFavoredCharms * 5;
    sheetData.system.charcreation.spent.bonuspoints += totalFavoredCharms * 4;
    sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (sheetData.system.willpower.max - sheetData.system.charcreation.available.willpower))) * 2;
    sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (sheetData.system.charcreation.spent.merits - sheetData.system.charcreation.available.merits)));
    sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (sheetData.system.charcreation.spent.specialties - sheetData.system.charcreation.available.specialties)));
    sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (sheetData.system.charcreation.spent.charms - sheetData.system.charcreation.available.charms))) * 4;

    sheetData.system.charcreation.spent.experience += (favoredAttributesSpent * 8) + (unFavoredAttributesSpent * 10);
    sheetData.system.charcreation.spent.experience += (favoredBPBelowThree * 4) + (nonfavoredBPBelowThree * 5);
    sheetData.system.charcreation.spent.experience += (aboveThreeFavored * 4) + (aboveThreeUnFavored * 5);
    sheetData.system.charcreation.spent.specialties = actorData.specialties.length;
    sheetData.system.charcreation.spent.experience += totalNonFavoredCharms * 12;
    sheetData.system.charcreation.spent.experience += totalFavoredCharms * 10;
    sheetData.system.charcreation.spent.experience += (Math.max(0, (sheetData.system.willpower.max - sheetData.system.charcreation.available.willpower))) * 6;
    sheetData.system.charcreation.spent.experience += (Math.max(0, (sheetData.system.charcreation.spent.merits - sheetData.system.charcreation.available.merits))) * 2;
    sheetData.system.charcreation.spent.experience += (Math.max(0, (sheetData.system.charcreation.spent.specialties - sheetData.system.charcreation.available.specialties))) * 2;
    sheetData.system.settings.usedotsvalues = !game.settings.get("exaltedthird", "compactSheets");
  }

  _prepareNPCData(sheetData) {
    sheetData.system.settings.usedotsvalues = !game.settings.get("exaltedthird", "compactSheetsNPC");
  }


  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize containers.
    const gear = [];
    const customAbilities = [];
    const weapons = [];
    const armor = [];
    const merits = [];
    const intimacies = [];
    const rituals = [];
    const martialarts = [];
    const crafts = [];
    const specialties = [];
    const specialAbilities = [];
    const craftProjects = [];
    const actions = [];
    const destinies = [];
    const shapes = [];
    const activeItems = [];

    const charms = {};
    const rollCharms = {};
    const defenseCharms = {};

    const siderealMaidenCharms = {
      archery: 'battles',
      athletics: 'endings',
      awareness: 'endings',
      brawl: 'battles',
      bureaucracy: 'endings',
      craft: 'serenity',
      dodge: 'serenity',
      integrity: 'endings',
      investigation: 'secrets',
      larceny: 'secrets',
      linguistics: 'serenity',
      lore: 'secrets',
      medicine: 'endings',
      melee: 'battles',
      occult: 'secrets',
      performance: 'serenity',
      presence: 'battles',
      resistance: 'journeys',
      ride: 'journeys',
      sail: 'journeys',
      socialize: 'serenity',
      stealth: 'secrets',
      survival: 'journeys',
      thrown: 'journeys',
      war: 'battles',
      battles: 'battles',
      journeys: 'journeys',
      secrets: 'secrets',
      serenity: 'serenity',
      endings: 'endings',
    }

    const spells = {
      terrestrial: { name: 'Ex3.Terrestrial', visible: false, list: [] },
      celestial: { name: 'Ex3.Celestial', visible: false, list: [] },
      solar: { name: 'Ex3.Solar', visible: false, list: [] },
      ivory: { name: 'Ex3.Ivory', visible: false, list: [] },
      shadow: { name: 'Ex3.Shadow', visible: false, list: [] },
      void: { name: 'Ex3.Void', visible: false, list: [] },
    }

    sheetData.system.maidencharms = {
      journeys: 0,
      serenity: 0,
      battles: 0,
      secrets: 0,
      endings: 0,
    }
    // Iterate through items, allocating to containers
    for (let i of sheetData.items) {
      i.img = i.img || DEFAULT_TOKEN;
      if (i.type === 'item') {
        gear.push(i);
      }
      else if (i.type === 'customability') {
        customAbilities.push(i);
      }
      else if (i.type === 'weapon') {
        prepareItemTraits('weapon', i);
        weapons.push(i);
      }
      else if (i.type === 'armor') {
        prepareItemTraits('armor', i);
        armor.push(i);
      }
      else if (i.type === 'merit') {
        merits.push(i);
      }
      else if (i.type === 'intimacy') {
        if (game.user.isGM || this.actor.isOwner || i.system.visible) {
          intimacies.push(i);
        }
      }
      else if (i.type === 'martialart') {
        martialarts.push(i);
      }
      else if (i.type === 'craft') {
        crafts.push(i);
      }
      else if (i.type === 'ritual') {
        rituals.push(i);
      }
      else if (i.type === 'specialty') {
        specialties.push(i);
      }
      else if (i.type === 'specialability') {
        specialAbilities.push(i);
      }
      else if (i.type === 'craftproject') {
        craftProjects.push(i);
      }
      else if (i.type === 'destiny') {
        destinies.push(i);
      }
      else if (i.type === 'shape') {
        shapes.push(i);
      }
      else if (i.type === 'spell') {
        if (i.system.circle !== undefined) {
          spells[i.system.circle].list.push(i);
          spells[i.system.circle].visible = true;
          spells[i.system.circle].collapse = this.actor.spells ? this.actor.spells[i.system.circle].collapse : true;
        }
      }
      else if (i.type === 'action') {
        actions.push(i);
      }
      if (i.system.active) {
        activeItems.push(i);
      }
    }

    let actorCharms = actorData.items.filter((item) => item.type === 'charm');
    actorCharms = actorCharms.sort(function (a, b) {
      const sortValueA = a.system.listingname.toLowerCase() || a.system.ability;
      const sortValueB = b.system.listingname.toLowerCase() || b.system.ability;
      if (sortValueA === sortValueB) {
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
      }
      return sortValueA < sortValueB ? -1 : sortValueA > sortValueB ? 1 : 0
    });

    for (let i of actorCharms) {
      if (siderealMaidenCharms[i.system.ability]) {
        sheetData.system.maidencharms[siderealMaidenCharms[i.system.ability]]++;
      }
      if (i.system.diceroller.enabled) {
        if (i.system.listingname) {
          if (!rollCharms[i.system.listingname]) {
            rollCharms[i.system.listingname] = { name: i.system.listingname, visible: true, list: [] };
          }
          rollCharms[i.system.listingname].list.push(i);
        }
        else {
          if (!rollCharms[i.system.ability]) {
            rollCharms[i.system.ability] = { name: CONFIG.exaltedthird.charmabilities[i.system.ability] || 'Ex3.Other', visible: true, list: [] };
          }
          rollCharms[i.system.ability].list.push(i);
        }
      }
      if (i.system.diceroller.opposedbonuses.enabled) {
        if (i.system.listingname) {
          if (!defenseCharms[i.system.listingname]) {
            defenseCharms[i.system.listingname] = { name: i.system.listingname, visible: true, list: [] };
          }
          defenseCharms[i.system.listingname].list.push(i);
        }
        else {
          if (!defenseCharms[i.system.ability]) {
            defenseCharms[i.system.ability] = { name: CONFIG.exaltedthird.charmabilities[i.system.ability] || 'Ex3.Other', visible: true, list: [] };
          }
          defenseCharms[i.system.ability].list.push(i);
        }
      }
      if (i.system.listingname) {
        if (!charms[i.system.listingname]) {
          charms[i.system.listingname] = { name: i.system.listingname, visible: true, list: [], collapse: this.actor?.charms ? this.actor?.charms[i.system.listingname]?.collapse : true };
        }
        charms[i.system.listingname].list.push(i);
      }
      else {
        if (!charms[i.system.ability]) {
          charms[i.system.ability] = { name: CONFIG.exaltedthird.charmabilities[i.system.ability] || 'Ex3.Other', visible: true, list: [], collapse: this.actor?.charms ? this.actor?.charms[i.system.ability]?.collapse : true };
        }
        charms[i.system.ability].list.push(i);
      }
    }

    // Assign and return
    actorData.gear = gear;
    actorData.customabilities = customAbilities;
    actorData.activeitems = activeItems;
    actorData.weapons = weapons;
    actorData.armor = armor;
    actorData.merits = merits;
    actorData.rituals = rituals;
    actorData.intimacies = intimacies;
    actorData.specialties = specialties;
    actorData.charms = charms;
    actorData.rollcharms = rollCharms;
    actorData.defensecharms = defenseCharms;
    actorData.spells = spells;
    actorData.specialabilities = specialAbilities;
    actorData.projects = craftProjects;
    actorData.actions = actions.sort((actionA, actionB) => actionA.name < actionB.name ? -1 : actionA.name > actionB.name ? 1 : 0);
    actorData.destinies = destinies;
    actorData.shapes = shapes;
  }

  /**
 * Prepare the data structure for traits data like languages
 * @param {object} traits   The raw traits data object from the actor data
 * @private
 */
  _prepareTraits(traits) {
    const map = {
      "languages": CONFIG.exaltedthird.languages,
      "resonance": CONFIG.exaltedthird.resonance,
      "dissonance": CONFIG.exaltedthird.dissonance,
    };
    for (let [t, choices] of Object.entries(map)) {
      const trait = traits[t];
      if (!trait) continue;
      let values = [];
      if (trait.value) {
        values = trait.value instanceof Array ? trait.value : [trait.value];
      }
      trait.selected = values.reduce((obj, t) => {
        obj[t] = choices[t];
        return obj;
      }, {});

      // Add custom entry
      if (trait.custom) {
        trait.custom.split(";").forEach((c, i) => trait.selected[`custom${i + 1}`] = c.trim());
      }
      trait.cssClass = !isEmpty(trait.selected) ? "" : "inactive";
    }
  }

  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    // Token Configuration
    const canConfigure = game.user.isGM || this.actor.isOwner;
    if (this.options.editable && canConfigure) {
      const settingsButton = {
        label: game.i18n.localize('Ex3.Settings'),
        class: 'sheet-settings',
        icon: 'fas fa-cog',
        onclick: () => this.sheetSettings(),
      };
      const helpButton = {
        label: game.i18n.localize('Ex3.Help'),
        class: 'help-dialogue',
        icon: 'fas fa-question',
        onclick: () => this.helpDialogue(this.actor.type),
      };
      buttons = [settingsButton, helpButton, ...buttons];
      const colorButton = {
        label: game.i18n.localize('Ex3.DotColors'),
        class: 'set-color',
        icon: 'fas fa-palette',
        onclick: (ev) => this.pickColor(ev),
      };
      buttons = [colorButton, ...buttons];
      const rollButton = {
        label: game.i18n.localize('Ex3.Roll'),
        class: 'roll-dice',
        icon: 'fas fa-dice-d10',
        onclick: (ev) => new RollForm(this.actor, { event: ev }, {}, { rollType: 'base' }).render(true),
      };
      buttons = [rollButton, ...buttons];
    }
    return buttons;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    this._setupDotCounters(html)
    this._setupSquareCounters(html)
    this._setupButtons(html)

    html.find('.item-row').click(ev => {
      const li = $(ev.currentTarget).next();
      li.toggle("fast");
    });

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.find('.trait-selector').click(this._onTraitSelector.bind(this));

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    html.find('.resource-value > .resource-value-step').click(this._onDotCounterChange.bind(this))
    html.find('.resource-value > .resource-value-empty').click(this._onDotCounterEmpty.bind(this))
    html.find('.resource-counter > .resource-counter-step').click(this._onSquareCounterChange.bind(this))

    html.find('.collapsable').click(ev => {
      let type = $(ev.currentTarget).data("type");
      const li = $(ev.currentTarget).next();
      if (type) {
        this.actor.update({ [`system.collapse.${type}`]: !li.is(":hidden") });
      }
    });

    html.find('.charm-list-collapsable').click(ev => {
      const li = $(ev.currentTarget).next();
      if (li.attr('id')) {
        this.actor.charms[li.attr('id')].collapse = !li.is(":hidden");
      }
      li.toggle("fast");
    });

    html.find('.spell-list-collapsable').click(ev => {
      const li = $(ev.currentTarget).next();
      if (li.attr('id')) {
        this.actor.spells[li.attr('id')].collapse = !li.is(":hidden");
      }
      li.toggle("fast");
    });

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      ev.stopPropagation();
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    html.find('.shape-edit').click(ev => {
      ev.stopPropagation();
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      const formActor = game.actors.get(item.system.actorid);
      if (formActor) {
        formActor.sheet.render(true);
      }
    });

    html.find('.item-favored').on('click', async (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const itemID = li.data('itemId');
      const item = this.actor.items.get(itemID);
      await this.actor.updateEmbeddedDocuments('Item', [
        {
          _id: itemID,
          system: {
            favored: !item.system.favored,
          },
        }
      ]);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      let applyChanges = false;
      new Dialog({
        title: 'Delete?',
        content: 'Are you sure you want to delete this item?',
        buttons: {
          delete: {
            icon: '<i class="fas fa-check"></i>',
            label: 'Delete',
            callback: () => applyChanges = true
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: 'Cancel'
          },
        },
        default: "delete",
        close: html => {
          if (applyChanges) {
            const li = $(ev.currentTarget).parents(".item");
            this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
            li.slideUp(200, () => this.render(false));
          }
        }
      }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
    });

    html.find(".charms-cheat-sheet").click(async ev => {
      const html = await renderTemplate("systems/exaltedthird/templates/dialogues/charms-dialogue.html");
      new Dialog({
        title: `Keywords`,
        content: html,
        buttons: {
          cancel: { label: "Close" }
        },
      }, { height: 1000, width: 1000, classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
    });

    html.find('.exalt-xp').mousedown(ev => {
      this.showDialogue('exalt-xp');
    });

    html.find('.show-experience').mousedown(ev => {
      this.showDialogue('experience');
    });

    html.find('.show-bonus-points').mousedown(ev => {
      this.showDialogue('bonus-points');
    });

    html.find('.show-weapon-tags').mousedown(ev => {
      this.showDialogue('weapons');
    });

    html.find('.show-armor-tags').mousedown(ev => {
      this.showDialogue('armor');
    });

    html.find('#calculate-health').mousedown(ev => {
      this.calculateHealth();
    });

    html.find('.rout-modifiers').mousedown(async ev => {
      this.showDialogue('rout');
    });

    html.find('.show-social').mousedown(ev => {
      this.showDialogue('social');
    });

    html.find('.show-combat').mousedown(ev => {
      this.showDialogue('combat');
    });

    html.find('.show-feats-of-strength').mousedown(ev => {
      this.showDialogue('feats-of-strength');
    });

    html.find('.show-advancement').mousedown(ev => {
      this.showDialogue('advancement');
    });

    html.find('.show-craft').mousedown(ev => {
      this.showDialogue('craft');
    });

    html.find('.set-pool-peripheral').mousedown(ev => {
      this.setSpendPool('peripheral');
    });

    html.find('.set-pool-personal').mousedown(ev => {
      this.setSpendPool('personal');
    });

    html.find('.calculate-personal-commit').mousedown(ev => {
      this.calculateCommitMotes('personal');
    });

    html.find('.calculate-peripheral-commit').mousedown(ev => {
      this.calculateCommitMotes('peripheral');
    });

    html.find('.calculate-motes').mousedown(ev => {
      this.calculateMotes();
    });

    html.find('.calculate-soak').mousedown(ev => {
      this.actor.calculateDerivedStats('soak');
    });

    html.find('.calculate-natural-soak').mousedown(ev => {
      this.actor.calculateDerivedStats('natural-soak');
    });

    html.find('.calculate-armored-soak').mousedown(ev => {
      this.actor.calculateDerivedStats('armored-soak');
    });

    html.find('.calculate-parry').mousedown(ev => {
      this.actor.calculateDerivedStats('parry');
    });

    html.find('.calculate-resonance').mousedown(ev => {
      this.actor.calculateDerivedStats('resonance');
    });

    html.find('.calculate-evasion').mousedown(ev => {
      this.actor.calculateDerivedStats('evasion');
    });

    html.find('.calculate-resolve').mousedown(ev => {
      this.actor.calculateDerivedStats('resolve');
    });

    html.find('.calculate-guile').mousedown(ev => {
      this.actor.calculateDerivedStats('guile');
    });

    html.find('.calculate-hardness').mousedown(ev => {
      this.actor.calculateDerivedStats('hardness');
    });

    html.find('#calculate-warstrider-health').mousedown(ev => {
      this.calculateHealth('warstrider');
    });

    html.find('#calculate-ship-health').mousedown(ev => {
      this.calculateHealth('ship');
    });

    html.find('#color-picker').mousedown(ev => {
      this.pickColor();
    });

    html.find('#healDamage').mousedown(ev => {
      this.recoverHealth();
    });

    html.find('#healDamageWarstrider').mousedown(ev => {
      this.recoverHealth('warstrider');
    });

    html.find('#healDamageShip').mousedown(ev => {
      this.recoverHealth('ship');
    });

    html.find('.add-defense-penalty').mousedown(ev => {
      addDefensePenalty(this.actor);
    });

    html.find('.add-onslaught-penalty').mousedown(ev => {
      addDefensePenalty(this.actor, 'Onslaught');
    });

    html.find('.subtract-defense-penalty').mousedown(ev => {
      subtractDefensePenalty(this.actor);
    });

    html.find('.subtract-onslaught-penalty').mousedown(ev => {
      subtractDefensePenalty(this.actor, 'Onslaught');
    });

    html.find('.add-new-item').click(async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const target = ev.currentTarget;
      var itemType = target.dataset.type;

      let items = game.items.filter(item => item.type === itemType);
      if (itemType === 'charm') {
        var ability = target.dataset.ability;
        items = items.filter(charm => charm.system.essence <= this.actor.system.essence.value || charm.system.ability === this.actor.system.details.supernal);
        if (this.object.exalt === 'exigent') {
          items = items.filter(charm => charm.system.charmtype === this.actor.system.details.exigent);
        } else {
          items = items.filter(charm => charm.system.charmtype === this.actor.system.details.exalt);
        }
        if (ability) {
          ability = this.actor.charms[ability].list[0]?.system.ability;
          items = items.filter(charm => charm.system.ability === ability);
        }
        items = items.filter(charm => {
          if (this.actor.system.attributes[charm.system.ability]) {
            return charm.system.requirement <= this.actor.system.attributes[charm.system.ability].value;
          }
          if (this.actor.system.abilities[charm.system.ability]) {
            return charm.system.requirement <= this.actor.system.abilities[charm.system.ability].value;
          }
          return true;
        });
      }
      if (itemType === 'spell') {
        items = items.filter(spell => {
          if (spell.system.circle === 'terrestrial' && this.actor.system.settings.sorcerycircle !== 'none') {
            return true;
          }
          if (spell.system.circle === 'celestial' && this.actor.system.settings.sorcerycircle !== 'terrestrial' && this.actor.system.settings.sorcerycircle !== 'none') {
            return true;
          }
          if (spell.system.circle === 'solar' && this.actor.system.settings.sorcerycircle === 'solar') {
            return true;
          }
          if (spell.system.circle === 'ivory' && this.actor.system.settings.necromancycircle !== 'none') {
            return true;
          }
          if (spell.system.circle === 'shadow' && this.actor.system.settings.necromancycircle !== 'ivory' && this.actor.system.settings.necromancycircle !== 'none') {
            return true;
          }
          if (spell.system.circle === 'void' && this.actor.system.settings.necromancycircle === 'void') {
            return true;
          }
          return false;
        });
      }
      const itemIds = this.actor.items.map(item => {
        const sourceId = item.flags?.core?.sourceId || ''; // Handle cases where sourceId is undefined
        const sections = sourceId.split('.'); // Split the sourceId by periods
        return sections.length > 1 ? sections.pop() : '';
      }).filter(section => section.trim() !== '');
      // const itemIds = [
      //   ...Object.values(this.actor.items.filter(item => item.type === 'charm')).map(charm => charm._id),
      // ];
      items = items.filter(item => !itemIds.includes(item._id));
      if (itemType === 'charm') {
        items = items.filter(charm => {
          return charm.system.charmprerequisites.length === 0 || itemIds.includes(charm._id) || charm.system.charmprerequisites.every(prerequisite => itemIds.includes(prerequisite.id));
        });
      }
      for (var item of items) {
        item.enritchedHTML = await TextEditor.enrichHTML(item.system.description, { async: true, secrets: true, relativeTo: item });
      }

      const sectionList = {};

      if (itemType === 'spell') {
        var circle = target.dataset.circle;
        if (circle) {
          sectionList[circle] = {
            name: CONFIG.exaltedthird.circles[circle],
            list: items.filter(item => item.system.circle === circle)
          }
        } else {
          if (items.some(item => item.system.circle === 'terrestrial')) {
            sectionList['terrestrial'] = {
              name: game.i18n.localize("Ex3.Terrestrial"),
              list: items.filter(item => item.system.circle === 'terrestrial')
            }
          }
          if (items.some(item => item.system.circle === 'celestial')) {
            sectionList['celestial'] = {
              name: game.i18n.localize("Ex3.Celestial"),
              list: items.filter(item => item.system.circle === 'celestial')
            }
          }
          if (items.some(item => item.system.circle === 'solar')) {
            sectionList['solar'] = {
              name: game.i18n.localize("Ex3.Solar"),
              list: items.filter(item => item.system.circle === 'solar')
            }
          }
          if (items.some(item => item.system.circle === 'ivory')) {
            sectionList['ivory'] = {
              name: game.i18n.localize("Ex3.Ivory"),
              list: items.filter(item => item.system.circle === 'ivory')
            }
          }
          if (items.some(item => item.system.circle === 'shadow')) {
            sectionList['shadow'] = {
              name: game.i18n.localize("Ex3.Shadow"),
              list: items.filter(item => item.system.circle === 'shadow')
            }
          }
          if (items.some(item => item.system.circle === 'void')) {
            sectionList['void'] = {
              name: game.i18n.localize("Ex3.Void"),
              list: items.filter(item => item.system.circle === 'void')
            }
          }
        }

      }
      else {
        for (const charm of items.sort(function (a, b) {
          const sortValueA = a.system.listingname.toLowerCase() || a.system.ability;
          const sortValueB = b.system.listingname.toLowerCase() || b.system.ability;
          return sortValueA < sortValueB ? -1 : sortValueA > sortValueB ? 1 : 0
        })) {
          if (charm.system.listingname) {
            if (!sectionList[charm.system.listingname]) {
              sectionList[charm.system.listingname] = { name: charm.system.listingname, list: [] };
            }
            sectionList[charm.system.listingname].list.push(charm);
          }
          else {
            if (!sectionList[charm.system.ability]) {
              sectionList[charm.system.ability] = { name: CONFIG.exaltedthird.charmabilities[charm.system.ability] || 'Ex3.Other', visible: true, list: [] };
            }
            sectionList[charm.system.ability].list.push(charm);
          }
        }
      }

      const template = "systems/exaltedthird/templates/dialogues/import-item.html";
      const html = await renderTemplate(template, { 'sectionList': sectionList });
      new Dialog({
        title: `Import Item`,
        content: html,
        buttons: {
          closeImportItem: { label: "Close" }
        },
        render: (html) => {
          html.find('.add-item').click(ev => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let item = items.find((item) => item._id === li.data("item-id"));
            this.actor.createEmbeddedDocuments("Item", [item])
            html.find('.closeImportItem').trigger('click');
          });

          html.find('.collapsable').click(ev => {
            const li = $(ev.currentTarget).next();
            li.toggle("fast");
          });
        },
      }, {
        height: 800,
        width: 650,
        resizable: true, classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`]
      }).render(true);
    });

    html.find('#rollDice').mousedown(ev => {
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'base' }).render(true);
    });

    html.find('.rollAbility').mousedown(ev => {
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'ability' }).render(true);
    });

    html.find('.prophecy').mousedown(ev => {
      new Prophecy(this.actor, {}, {}, {}).render(true);
    });

    html.find('.roll-ability').mousedown(ev => {
      var ability = $(ev.target).attr("data-ability");
      if (ability === 'willpower') {
        if (this.actor.type === "npc") {
          game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'rout', pool: 'willpower' }).render(true);
        }
        else {
          game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'ability', ability: 'willpower', attribute: 'none' }).render(true);
        }
      }
      else {
        const abilityObject = this.actor.system.abilities[ability];
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'ability', ability: ability, attribute: abilityObject.prefattribute }).render(true);
      }
    });

    html.find('.roll-pool').mousedown(ev => {
      var pool = $(ev.target).attr("data-pool");
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'ability', pool: pool }).render(true);
    });

    html.find('.roll-action').mousedown(ev => {
      let li = $(event.currentTarget).parents(".item");
      let item = this.actor.items.get(li.data("item-id"));
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'ability', pool: item.id }).render(true);
    });

    html.find('.rout-check').mousedown(ev => {
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'rout', pool: 'willpower' }).render(true);
    });

    html.find('.roll-ma').mousedown(ev => {
      let li = $(event.currentTarget).parents(".item");
      let item = this.actor.items.get(li.data("item-id"));
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'ability', ability: item.id }).render(true);
    });

    html.find('.roll-craft').mousedown(ev => {
      let li = $(event.currentTarget).parents(".item");
      let item = this.actor.items.get(li.data("item-id"));
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'ability', ability: item.id }).render(true);
    });

    html.find('.join-battle').mousedown(ev => {
      if (this.actor.type === "npc") {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'joinBattle', pool: 'joinbattle' }).render(true);
      }
      else {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'joinBattle', ability: 'awareness', attribute: 'wits' }).render(true);
      }
    });

    html.find('.accuracy').mousedown(ev => {
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'accuracy' }).render(true);
    });

    html.find('.damage').mousedown(ev => {
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'damage' }).render(true);
    });

    html.find('.rush').mousedown(ev => {
      if (this.actor.type === "npc") {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'rush', pool: 'movement' }).render(true);
      }
      else {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'rush', ability: 'athletics', attribute: 'dexterity' }).render(true);
      }
    });

    html.find('.disengage').mousedown(ev => {
      if (this.actor.type === "npc") {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'disengage', pool: 'movement' }).render(true);
      }
      else {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'disengage', ability: 'dodge', attribute: 'dexterity' }).render(true);
      }
    });

    html.find('.grapple-control').mousedown(ev => {
      if (this.actor.type === "npc") {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'grappleControl', pool: 'grapple' }).render(true);
      }
      else {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'grappleControl' }).render(true);
      }
    });

    html.find('.command').mousedown(ev => {
      if (this.actor.type === "npc") {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'command', pool: 'command' }).render(true);
      }
      else {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'command' }).render(true);
      }
    });

    html.find('.shape-sorcery').mousedown(ev => {
      if (this.actor.type === "npc") {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'sorcery', pool: 'sorcery' }).render(true);
      }
      else {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'sorcery', ability: 'occult', attribute: 'intelligence' }).render(true);
      }
    });

    html.find('.read-intentions').mousedown(ev => {
      if (this.actor.type === "npc") {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'readIntentions', pool: 'readintentions' }).render(true);
      }
      else {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'readIntentions', ability: 'socialize', attribute: 'perception' }).render(true);
      }
    });

    html.find('.social-influence').mousedown(ev => {
      if (this.actor.type === "npc") {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'social', pool: 'social' }).render(true);
      }
      else {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'social', ability: 'socialize', attribute: 'charisma' }).render(true);
      }
    });

    html.find('#import-stuff').mousedown(async ev => {
      new Importer().render(true);
    });

    html.find('.weapon-roll').click(ev => {
      let item = this.actor.items.get($(ev.target).attr("data-item-id"));
      let rollType = $(ev.target).attr("data-roll-type");
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: rollType, weapon: item.system }).render(true);
    });

    html.find('.weapon-icon').click(ev => {
      ev.stopPropagation();
      let item = this.actor.items.get($(ev.target.parentElement).attr("data-item-id"));
      let rollType = $(ev.target.parentElement).attr("data-roll-type");
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: rollType, weapon: item.system }).render(true);
    });

    html.find('#anima-up').click(ev => {
      this._updateAnima("up");
    });

    html.find('#anima-down').click(ev => {
      this._updateAnima("down");
    });

    html.find('.toggle-poison').click(ev => {
      ev.preventDefault();
      ev.stopPropagation();
      // Render the chat card template
      let li = $(ev.currentTarget).parents(".item");
      let item = this.actor.items.get(li.data("item-id"));
      item.update({
        [`system.poison.apply`]: !item.system.poison.apply,
      });
    });

    html.find('.toggle-equipped').click(ev => {
      ev.preventDefault();
      ev.stopPropagation();
      // Render the chat card template
      let li = $(ev.currentTarget).parents(".item");
      let item = this.actor.items.get(li.data("item-id"));
      item.update({
        [`system.equipped`]: !item.system.equipped,
      });
    });

    html.find('.toggle-visible').click(ev => {
      ev.preventDefault();
      ev.stopPropagation();
      // Render the chat card template
      let li = $(ev.currentTarget).parents(".item");
      let item = this.actor.items.get(li.data("item-id"));
      item.update({
        [`system.visible`]: !item.system.visible,
      });
    });

    html.find('.data-chat').click(ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this._displayDataChat(ev);
    });

    html.find('.item-chat').click(ev => {
      ev.preventDefault();
      ev.stopPropagation();
      // Render the chat card template
      let li = $(ev.currentTarget).parents(".item");
      let item = this.actor.items.get(li.data("item-id"));
      this._displayCard(item);
    });

    html.find('.craft-project').click(ev => {
      var type = $(ev.target).attr("data-type");
      new RollForm(this.actor, { event: ev }, {}, { rollType: 'craft', ability: "craft", craftType: type, craftRating: 2 }).render(true);
    });

    html.find('.sorcerous-working').click(ev => {
      if (this.actor.type === "npc") {
        new RollForm(this.actor, { event: ev }, {}, { rollType: 'working', pool: "sorcery" }).render(true);
      }
      else {
        new RollForm(this.actor, { event: ev }, {}, { rollType: 'working', ability: "occult", attribute: 'intelligence' }).render(true);
      }
    });

    html.find('.item-complete').click(ev => {
      this._completeCraft(ev);
    });

    html.find('.add-opposing-charm').click(ev => {
      this._addOpposingCharm(ev);
    });

    html.find('.item-spend').click(ev => {
      this._spendItem(ev);
    });

    html.find('.lunar-sync').click(ev => {
      this._lunarSync();
    });

    html.find('.lunar-sync').click(ev => {
      this._lunarSync();
    });

    html.find('.quick-roll').click(ev => {
      let li = $(event.currentTarget).parents(".item");
      new RollForm(this.actor, { event: ev }, {}, { rollId: li.data("saved-roll-id"), skipDialog: true }).roll();
    });

    html.find('.saved-roll').click(ev => {
      let li = $(event.currentTarget).parents(".item");
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollId: li.data("saved-roll-id") }).render(true);
    });

    html.find('.anima-flux').click(ev => {
      if (game.user.targets && game.user.targets.size > 0) {
        for (const target of game.user.targets) {
          const tokenId = target.actor.token?.id || target.actor.getActiveTokens()[0]?.id;
          let combatant = game.combat.combatants.find(c => c.tokenId == tokenId);
          var roll = new Roll(`1d10cs>=7`).evaluate({ async: false });
          let diceDisplay = "";
          var total = roll.total;
          for (let dice of roll.dice[0].results.sort((a, b) => b.result - a.result)) {
            if (dice.result === 10) {
              diceDisplay += `<li class="roll die d10 success double-success">${dice.result}</li>`;
            }
            else if (dice.result >= 7) { diceDisplay += `<li class="roll die d10 success">${dice.result}</li>`; }
            else if (dice.rerolled) { diceDisplay += `<li class="roll die d10 rerolled">${dice.result}</li>`; }
            else if (dice.result == 1) { diceDisplay += `<li class="roll die d10 failure">${dice.result}</li>`; }
            else { diceDisplay += `<li class="roll die d10">${dice.result}</li>`; }
            if (dice.result >= 10) {
              total += 1;
            }
          }
          let resultsMessage = `<h4 class="dice-total">${total} Damage</h4>`;
          if (total > 0) {
            if (game.combat) {
              if (combatant && combatant.initiative != null) {
                if (combatant.initiative > 0) {
                  if (target.actor.system.hardness.value <= 0) {
                    if (game.user.isGM) {
                      game.combat.setInitiative(combatant.id, combatant.initiative - total);
                    }
                    else {
                      game.socket.emit('system.exaltedthird', {
                        type: 'updateInitiative',
                        id: combatant.id,
                        data: combatant.initiative - total,
                        // crasherId: crasherId,
                      });
                    }
                  }
                }
                else {
                  let totalHealth = 0;
                  const targetActorData = duplicate(target.actor);
                  for (let [key, health_level] of Object.entries(targetActorData.system.health.levels)) {
                    totalHealth += health_level.value;
                  }
                  targetActorData.system.health.lethal = Math.min(totalHealth - targetActorData.system.health.bashing - targetActorData.system.health.aggravated, targetActorData.system.health.lethal + total);
                  if (game.user.isGM) {
                    target.actor.update(targetActorData);
                  }
                  else {
                    game.socket.emit('system.exaltedthird', {
                      type: 'updateTargetData',
                      id: target.id,
                      data: targetActorData,
                    });
                  }
                }
              }
            }
            if (combatant.initiative > 0 && target.actor.system.hardness.value > 0) {
              resultsMessage = `<h4 class="dice-total">Blocked by hardness</h4>`;
            }
          }
          let messageContent = `
          <div class="dice-roll">
              <div class="dice-result">
                  <h4 class="dice-formula">Anima Flux vs ${target.actor.name}</h4>
                  <div class="dice-tooltip">
                      <div class="dice">
                          <ol class="dice-rolls">${diceDisplay}</ol>
                      </div>
                  </div>
                  ${resultsMessage}
              </div>
          </div>`;
          ChatMessage.create({ user: game.user.id, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: roll, content: messageContent });
        }
      }
      else {
        ui.notifications.warn('Ex3.NoTargets', {
          localize: true,
        });
      }
    });

    html.find('.delete-saved-roll').click(ev => {
      let li = $(event.currentTarget).parents(".item");
      var key = li.data("saved-roll-id");
      const rollDeleteString = "data.savedRolls.-=" + key;

      let deleteConfirm = new Dialog({
        title: "Delete",
        content: "Delete Saved Roll?",
        buttons: {
          Yes: {
            icon: '<i class="fa fa-check"></i>',
            label: "Delete",
            callback: dlg => {
              this.actor.update({ [rollDeleteString]: null });
              ui.notifications.notify(`Saved Roll Deleted`);
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel"
          },
        },
        default: 'Yes'
      });
      deleteConfirm.render(true);
    });

    $(document.getElementById('chat-log')).on('click', '.chat-card', (ev) => {
      const li = $(ev.currentTarget).next();
      li.toggle("fast");
    });

    html.find('.npc-action').on('change', async (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const itemID = li.data('itemId');
      const newNumber = parseInt(ev.currentTarget.value);
      await this.actor.updateEmbeddedDocuments('Item', [
        {
          _id: itemID,
          system: {
            value: newNumber,
          },
        }
      ]);
    });

    html.find('.list-ability').on('change', async (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const itemID = li.data('itemId');
      const newNumber = parseInt(ev.currentTarget.value);
      await this.actor.updateEmbeddedDocuments('Item', [
        {
          _id: itemID,
          system: {
            points: newNumber,
          },
        }
      ]);
    });

    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      let savedRollhandler = ev => this._onDragSavedRoll(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        if (li.classList.contains("saved-roll-row")) {
          li.addEventListener("dragstart", savedRollhandler, false);
        }
        else {
          li.addEventListener("dragstart", handler, false);
        }
      });
    }
  }

  async _onDragSavedRoll(ev) {
    const li = ev.currentTarget;
    if (ev.target.classList.contains("content-link")) return;
    const savedRoll = this.actor.system.savedRolls[li.dataset.itemId];
    ev.dataTransfer.setData("text/plain", JSON.stringify({ actorId: this.actor.uuid, type: 'savedRoll', id: li.dataset.itemId, name: savedRoll.name }));
  }

  _updateAnima(direction) {
    let newAnima = this.actor.system.anima;
    let newLevel = this.actor.system.anima.level;
    let newValue = this.actor.system.anima.value;
    if (direction === "up") {
      if (this.actor.system.anima.level !== "Transcendent") {
        if (this.actor.system.anima.level === "Dim") {
          newLevel = "Glowing";
          newValue = 1;
        }
        else if (this.actor.system.anima.level === "Glowing") {
          newLevel = "Burning";
          newValue = 2;
        }
        else {
          newLevel = "Bonfire";
          newValue = 3;
        }
      }
      if (this.actor.system.anima.level === 'Bonfire' && this.actor.system.anima.max === 4) {
        newLevel = "Transcendent";
        newValue = 4;
      }
    }
    else {
      if (this.actor.system.anima.level === "Transcendent") {
        newLevel = "Bonfire";
        newValue = 3;
      }
      else if (this.actor.system.anima.level === "Bonfire") {
        newLevel = "Burning";
        newValue = 2;
      }
      else if (this.actor.system.anima.level === "Burning") {
        newLevel = "Glowing";
        newValue = 1;
      }
      else if (this.actor.system.anima.level === "Glowing") {
        newLevel = "Dim";
        newValue = 0;
      }
    }
    newAnima.level = newLevel;
    newAnima.value = newValue;
    animaTokenMagic(this.actor, newValue);
    this.actor.update({ [`system.anima`]: newAnima });
  }

  async setSpendPool(type) {
    this.actor.update({ [`system.settings.charmmotepool`]: type });
  }

  async calculateCommitMotes(type) {
    var commitMotes = 0;
    for (const item of this.actor.items.filter((i) => i.type === 'weapon' || i.type === 'armor' || i.type === 'item')) {
      if (item.type === 'item' || item.system.equipped) {
        commitMotes += item.system.attunement;
      }
    }
    this.actor.update({ [`system.motes.${type}.committed`]: commitMotes });
  }

  async calculateMotes() {
    const system = this.actor.system;

    if (system.details.exalt === 'other' || (this.actor.type === 'npc' && system.creaturetype !== 'exalt')) {
      system.motes.personal.max = 10 * system.essence.value;
      if (system.creaturetype === 'god' || system.creaturetype === 'undead' || system.creaturetype === 'demon') {
        system.motes.personal.max += 50;
      }
      system.motes.personal.value = (system.motes.personal.max - this.actor.system.motes.personal.committed);
    }
    else {
      system.motes.personal.max = this.actor.calculateMaxExaltedMotes('personal', this.actor.system.details.exalt, this.actor.system.essence.value);
      system.motes.peripheral.max = this.actor.calculateMaxExaltedMotes('peripheral', this.actor.system.details.exalt, this.actor.system.essence.value);
      system.motes.personal.value = (system.motes.personal.max - this.actor.system.motes.personal.committed);
      system.motes.peripheral.value = (system.motes.peripheral.max - this.actor.system.motes.peripheral.committed);
    }
    this.actor.update({ [`system.motes`]: system.motes });
  }

  async calculateHealth(healthType = 'person') {
    let confirmed = false;
    var oxBodyText = '';

    if (this.actor.type !== 'npc') {
      if (this.actor.system.details.exalt === 'solar' || this.actor.system.details.exalt === 'abyssal') {
        if (this.actor.system.attributes.stamina.value < 3) {
          oxBodyText = 'Ox Body: One -1 and one -2 level.';
        }
        else if (this.actor.system.attributes.stamina.value < 5) {
          oxBodyText = 'Ox Body: One -1 and two -2 levels.';
        }
        else {
          oxBodyText = 'Ox Body: One -0, one -1, and one -2 level';
        }
      }
      if (this.actor.system.details.exalt === 'dragonblooded') {
        if (this.actor.system.attributes.stamina.value < 3) {
          oxBodyText = 'Ox Body: Two -2 levels';
        }
        else if (this.actor.system.attributes.stamina.value < 5) {
          oxBodyText = 'Ox Body: One -1 and one -2 level';
        }
        else {
          oxBodyText = 'Ox Body: One -1 and two -2 levels';
        }
      }
      if (this.actor.system.details.exalt === 'lunar') {
        if (this.actor.system.attributes.stamina.value < 3) {
          oxBodyText = 'Ox Body: Two -2 levels.';
        }
        else if (this.actor.system.attributes.stamina.value < 5) {
          oxBodyText = 'Ox Body: Two -2 levels and one -4 level';
        }
        else {
          oxBodyText = 'Ox Body: Two -2 levels and two -4 levels';
        }
      }
      else if (this.actor.system.details.exalt === 'sidereal') {
        if (this.actor.system.attributes.stamina.value < 3) {
          oxBodyText = 'Ox Body: One -0 level.';
        }
        else if (this.actor.system.attributes.stamina.value < 5) {
          oxBodyText = 'Ox Body: One -0 level and one -1 level';
        }
        else {
          oxBodyText = 'Ox Body: Two -0 levels';
        }
      }
      else if (this.actor.system.details.caste.toLowerCase() === 'strawmaiden' || this.actor.system.details.caste.toLowerCase() === 'janest') {
        if (this.actor.system.attributes.stamina.value < 3) {
          oxBodyText = 'Ox Body: One -1 level and one -2 level';
        }
        else if (this.actor.system.attributes.stamina.value < 5) {
          oxBodyText = 'Ox Body: One -1 level and two -2 levels';
        }
        else {
          oxBodyText = 'Ox Body: One -1 level, One -2 level, Two -4 levels';
        }
      }
      else if (this.actor.system.details.caste.toLowerCase() === 'puppeteer') {
        if (this.actor.system.attributes.stamina.value < 3) {
          oxBodyText = 'Ox Body: Two -2 levels';
        }
        else if (this.actor.system.attributes.stamina.value < 5) {
          oxBodyText = 'Ox Body: One -1 level and one -2 level';
        }
        else {
          oxBodyText = 'Ox Body: Two -1 levels';
        }
      }
      else if (this.actor.system.details.caste.toLowerCase() === 'architect') {
        if (this.actor.system.attributes.stamina.value < 3) {
          oxBodyText = 'Ox Body: Two -2 levels';
        }
        else if (this.actor.system.attributes.stamina.value < 5) {
          oxBodyText = 'Ox Body: Two -2 levels and One -4 level';
        }
        else {
          oxBodyText = 'Ox Body: One -1 level and Two -2 Levels';
        }
      }
      else if (this.actor.system.details.exalt === 'sovereign') {
        if (this.actor.system.attributes.stamina.value < 3) {
          oxBodyText = 'Ox Body: One -2 level and One -4 level';
        }
        else if (this.actor.system.attributes.stamina.value < 5) {
          oxBodyText = 'Ox Body: One -2 level and Two -4 levels';
        }
        else {
          oxBodyText = 'Ox Body: One -2 level and Three -4 levels';
        }
      }
    }


    var template = "systems/exaltedthird/templates/dialogues/calculate-health.html";

    var templateData = {
      'oxBodyText': oxBodyText,
      'healthType': healthType,
      'hasOxBody': false,
    }
    if (healthType === 'warstrider') {
      templateData.zero = this.actor.system.warstrider.health.levels.zero.value;
      templateData.one = this.actor.system.warstrider.health.levels.one.value;
      templateData.two = this.actor.system.warstrider.health.levels.two.value;
      templateData.four = this.actor.system.warstrider.health.levels.four.value;
    }
    else if (healthType === 'ship') {
      templateData.zero = this.actor.system.ship.health.levels.zero.value;
      templateData.one = this.actor.system.ship.health.levels.one.value;
      templateData.two = this.actor.system.ship.health.levels.two.value;
      templateData.four = this.actor.system.ship.health.levels.four.value;
    }
    else {
      templateData.zero = this.actor.system.health.levels.zero.value;
      templateData.one = this.actor.system.health.levels.one.value;
      templateData.two = this.actor.system.health.levels.two.value;
      templateData.three = this.actor.system.health.levels.three.value;
      templateData.four = this.actor.system.health.levels.four.value;
      templateData.penaltyMod = this.actor.system.health.penaltymod;
      if (this.actor.type === 'character' && (['solar', 'lunar', 'dragonblooded', 'sidereal'].includes(this.actor.system.details.exalt) || ['janest', 'strawmaiden', 'puppeteer', 'architect', 'sovereign'].includes(this.actor.system.details.caste.toLowerCase()))) {
        templateData.hasOxBody = true;
      }
    }

    if (this.actor.system.battlegroup && healthType === 'person') {
      template = "systems/exaltedthird/templates/dialogues/calculate-battlegroup-health.html";
      templateData.hasOxBody = false;
    }

    const html = await renderTemplate(template, templateData);

    new Dialog({
      title: `Calculate Health`,
      content: html,
      buttons: {
        roll: { label: "Save", callback: () => confirmed = true },
        cancel: { label: "Cancel", callback: () => confirmed = false }
      },
      close: html => {
        if (confirmed) {
          let zero = parseInt(html.find('#zero').val()) || 0;
          let one = parseInt(html.find('#one').val()) || 0;
          let two = parseInt(html.find('#two').val()) || 0;
          let four = parseInt(html.find('#four').val()) || 0;
          let penaltyMod = parseInt(html.find('#penaltyMod').val()) || 0;
          let healthData = {
            levels: {
              zero: {
                value: zero,
              },
              one: {
                value: one,
              },
              two: {
                value: two,
              },
              four: {
                value: four,
              },
            },
            penaltymod: penaltyMod,
            bashing: 0,
            lethal: 0,
            aggravated: 0,
          }
          if (healthType === 'person') {
            let three = parseInt(html.find('#three').val()) || 0;
            healthData.levels.three = {
              value: three,
            }
            this.actor.update({ [`system.health`]: healthData });
          }
          else {
            this.actor.update({ [`system.${healthType}.health`]: healthData });
          }
        }
      },
      render: (html) => {
        html.find('.add-ox-body').click(ev => {
          const oxBodyChart = {
            solar: {
              5: {
                zero: 1,
                one: 1,
                two: 1,
              },
              4: {
                one: 1,
                two: 2,
              },
              2: {
                one: 1,
                two: 1,
              },
            },
            dragonblooded: {
              5: {
                one: 1,
                two: 2,
              },
              4: {
                one: 1,
                two: 1,
              },
              2: {
                two: 2,
              },
            },
            lunar: {
              5: {
                two: 2,
                four: 2,
              },
              4: {
                two: 2,
                four: 1,
              },
              2: {
                two: 2,
              },
            },
            sidereal: {
              5: {
                zero: 2,
              },
              4: {
                zero: 1,
                one: 1,
              },
              2: {
                zero: 1,
              },
            },
            janest: {
              5: {
                one: 1,
                two: 1,
                four: 2,
              },
              4: {
                one: 1,
                two: 2,
              },
              2: {
                one: 1,
                two: 1,
              },
            },
            strawmaiden: {
              5: {
                one: 1,
                two: 1,
                four: 2,
              },
              4: {
                one: 1,
                two: 2,
              },
              2: {
                one: 1,
                two: 1,
              },
            },
            puppeteer: {
              5: {
                one: 2,
              },
              4: {
                one: 1,
                two: 1,
              },
              2: {
                two: 2,
              },
            },
            architect: {
              5: {
                one: 1,
                two: 2,
              },
              4: {
                two: 2,
                four: 1,
              },
              2: {
                two: 2,
              },
            },
            sovereign: {
              5: {
                two: 1,
                four: 3,
              },
              4: {
                two: 1,
                four: 2,
              },
              2: {
                two: 1,
                four: 1,
              },
            }
          }

          if (oxBodyChart[this.actor.system.details.exalt]) {
            for (let [staminaValue, staminaDetails] of Object.entries(oxBodyChart[this.actor.system.details.exalt]).sort(([keyA], [keyB]) => Number(keyB) - Number(keyA))) {
              if (this.actor.system.attributes.stamina.value >= parseInt(staminaValue)) {
                for (let [levelValue, healthLevel] of Object.entries(staminaDetails)) {
                  html.find(`#${levelValue}`).val((parseInt(html.find(`#${levelValue}`).val()) || 0) + healthLevel);
                }
                break;
              }
            }
          }
        });
      },
    }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
  }

  async recoverHealth(healthType = 'person') {
    let newDamage = {
      bashing: 0,
      lethal: 0,
      aggravated: 0,
    }
    if (healthType === 'person') {
      this.actor.update({ [`system.health`]: newDamage });
    }
    else {
      this.actor.update({ [`system.${healthType}.health`]: newDamage });
    }
  }

  async showDialogue(type) {
    var template = "systems/exaltedthird/templates/dialogues/armor-tags.html";
    switch (type) {
      case 'experience':
        template = "systems/exaltedthird/templates/dialogues/experience-points-dialogue.html";
        break;
      case 'weapons':
        template = "systems/exaltedthird/templates/dialogues/weapon-tags.html";
        break;
      case 'craft':
        template = "systems/exaltedthird/templates/dialogues/craft-cheatsheet.html";
        break;
      case 'advancement':
        template = "systems/exaltedthird/templates/dialogues/advancement-dialogue.html";
        break;
      case 'combat':
        template = "systems/exaltedthird/templates/dialogues/combat-dialogue.html";
        break;
      case 'social':
        template = "systems/exaltedthird/templates/dialogues/social-dialogue.html";
        break;
      case 'rout':
        template = "systems/exaltedthird/templates/dialogues/rout-modifiers.html";
        break;
      case 'exalt-xp':
        template = "systems/exaltedthird/templates/dialogues/exalt-xp-dialogue.html";
        break;
      case 'feats-of-strength':
        template = "systems/exaltedthird/templates/dialogues/feats-of-strength-dialogue.html";
        break;
      case 'bonus-points':
        template = "systems/exaltedthird/templates/dialogues/bonus-points-dialogue.html";
        break;
      default:
        break;
    }
    const html = await renderTemplate(template, { 'exalt': this.actor.system.details.exalt, 'caste': this.actor.system.details.caste.toLowerCase(), 'flatXP': game.settings.get("exaltedthird", "flatXP"), 'unifiedCharacterCreation': game.settings.get("exaltedthird", "unifiedCharacterCreation") });
    new Dialog({
      title: `Info Dialogue`,
      content: html,
      buttons: {
        cancel: { label: "Close" }
      }
    }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
  }

  async pickColor() {
    let confirmed = false;
    const html = await renderTemplate("systems/exaltedthird/templates/dialogues/color-picker.html", { 'color': this.actor.system.details.color, 'animaColor': this.actor.system.details.animacolor });
    new Dialog({
      title: `Pick Color`,
      content: html,
      buttons: {
        roll: { label: "Save", callback: () => confirmed = true },
        cancel: { label: "Cancel", callback: () => confirmed = false }
      },
      close: html => {
        if (confirmed) {
          let color = html.find('#color').val();
          let animaColor = html.find('#animaColor').val();
          if (isColor(color)) {
            this.actor.update({ [`system.details.color`]: color });
          }
          if (isColor(animaColor)) {
            this.actor.update({ [`system.details.animacolor`]: animaColor });
          }
        }
      }
    }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
  }

  async sheetSettings() {
    let confirmed = false;
    const template = "systems/exaltedthird/templates/dialogues/sheet-settings.html"
    const html = await renderTemplate(template, { 'actorType': this.actor.type, settings: this.actor.system.settings, 'maxAnima': this.actor.system.anima.max, 'lunarFormEnabled': this.actor.system.lunarform?.enabled, 'showExigentType': this.actor.system.details.exalt === 'exigent' });
    new Dialog({
      title: `Settings`,
      content: html,
      buttons: {
        save: { label: "Save", callback: () => confirmed = true },
        cancel: { label: "Close", callback: () => confirmed = false }
      },
      close: html => {
        if (confirmed) {
          let newSettings = {
            charmmotepool: html.find('#charmMotePool').val(),
            martialartsmastery: html.find('#martialArtsMastery').val(),
            sheetbackground: html.find('#sheetBackground').val(),
            exigenttype: html.find('#exigentType').val(),
            sorcerycircle: html.find('#sorceryCircle').val(),
            necromancycircle: html.find('#necromancyCircle').val(),
            smaenlightenment: html.find('#smaEnlightenment').is(":checked"),
            showwarstrider: html.find('#showWarstrider').is(":checked"),
            showship: html.find('#showShip').is(":checked"),
            showescort: html.find('#showEscort').is(":checked"),
            usetenattributes: html.find('#useTenAttributes').is(":checked"),
            usetenabilities: html.find('#useTenAbilities').is(":checked"),
            rollStunts: html.find('#rollStunts').is(":checked"),
            defenseStunts: html.find('#defenseStunts').is(":checked"),
            showanima: html.find('#showAnima').is(":checked"),
            editmode: html.find('#editMode').is(":checked"),
            hasaura: html.find('#hasAura').is(":checked"),
            issorcerer: html.find('#isSorcerer').is(":checked"),
            iscrafter: html.find('#isCrafter').is(":checked"),
          }
          if (this.actor.type === 'npc') {
            this.actor.update({ [`system.lunarform.enabled`]: html.find('#lunarFormEnabled').is(":checked") });
          }
          this.actor.update({ [`system.settings`]: newSettings, [`system.anima.max`]: parseInt(html.find('#maxAnima').val()) });
        }
      }
    }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
  }

  async helpDialogue(type) {
    let confirmed = false;
    const template = "systems/exaltedthird/templates/dialogues/help-dialogue.html"
    const html = await renderTemplate(template, { 'type': type });
    new Dialog({
      title: `ReadMe`,
      content: html,
      buttons: {
        cancel: { label: "Close", callback: () => confirmed = false }
      }
    }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
  }

  _onSquareCounterChange(event) {
    event.preventDefault()
    const element = event.currentTarget
    const index = Number(element.dataset.index)
    const parent = $(element.parentNode)
    const data = parent[0].dataset
    const states = parseCounterStates(data.states)
    const fields = data.name.split('.')
    const steps = parent.find('.resource-counter-step')

    if (index < 0 || index > steps.length) {
      return
    }

    const currentState = steps[index].dataset.state;
    if (steps[index].dataset.type) {
      if (currentState === '') {
        for (const step of steps) {
          if (step.dataset.state === '') {
            step.dataset.state = 'x';
            data['value'] = Number(data['value']) + 1;
            break;
          }
        }
      }
      else {
        for (const step of steps) {
          if (step.dataset.state === 'x') {
            step.dataset.state = '';
            data['value'] = Number(data['value']) - 1;
            break;
          }
        }
      }
    }
    else {
      if (currentState === '') {
        for (const step of steps) {
          if (step.dataset.state === '') {
            step.dataset.state = '/';
            data['bashing'] = Number(data['bashing']) + 1;
            break;
          }
        }
      }
      if (currentState === '/') {
        for (const step of steps) {
          if (step.dataset.state === '/') {
            step.dataset.state = 'x';
            data['lethal'] = Number(data['lethal']) + 1;
            data['bashing'] = Number(data['bashing']) - 1;
            break;
          }
        }
      }
      if (currentState === 'x') {
        for (const step of steps) {
          if (step.dataset.state === 'x') {
            step.dataset.state = '*';
            data['aggravated'] = Number(data['aggravated']) + 1;
            data['lethal'] = Number(data['lethal']) - 1;
            break;
          }
        }
      }
      if (currentState === '*') {
        for (const step of steps) {
          if (step.dataset.state === '*') {
            step.dataset.state = '';
            data['aggravated'] = Number(data['aggravated']) - 1;
            break;
          }
        }
      }
    }

    const newValue = Object.values(states).reduce(function (obj, k) {
      obj[k] = Number(data[k]) || 0
      return obj
    }, {})

    this._assignToActorField(fields, newValue)
  }


  _onDotCounterChange(event) {
    event.preventDefault()
    const color = this.actor.system.details.color;
    const element = event.currentTarget
    const dataset = element.dataset
    const index = Number(dataset.index)
    const itemID = dataset.id;
    const parent = $(element.parentNode)
    const fieldStrings = parent[0].dataset.name
    const fields = fieldStrings.split('.')
    const steps = parent.find('.resource-value-step')
    if (index < 0 || index > steps.length) {
      return
    }

    steps.removeClass('active')
    steps.each(function (i) {
      if (i <= index) {
        // $(this).addClass('active')
        $(this).css("background-color", color);
      }
    })
    if (itemID) {
      const item = this.actor.items.get(itemID);
      let newVal = index + 1;
      if (index === 0 && item.system.points === 1) {
        newVal = 0;
      }
      if (item) {
        this.actor.updateEmbeddedDocuments('Item', [
          {
            _id: itemID,
            system: {
              points: newVal,
            },
          }
        ]);
      }
    }
    else {
      this._assignToActorField(fields, index + 1);
    }
  }

  _assignToActorField(fields, value) {
    const actorData = duplicate(this.actor)
    // update actor owned items
    if (fields.length === 2 && fields[0] === 'items') {
      for (const i of actorData.items) {
        if (fields[1] === i._id) {
          i.data.points = value
          break
        }
      }
    } else {
      const lastField = fields.pop()
      if (fields.reduce((data, field) => data[field], actorData)[lastField] === 1 && value === 1) {
        fields.reduce((data, field) => data[field], actorData)[lastField] = 0;
      }
      else {
        fields.reduce((data, field) => data[field], actorData)[lastField] = value
      }
    }
    this.actor.update(actorData)
  }

  _onDotCounterEmpty(event) {
    event.preventDefault()
    const actorData = duplicate(this.actor)
    const element = event.currentTarget
    const parent = $(element.parentNode)
    const fieldStrings = parent[0].dataset.name
    const fields = fieldStrings.split('.')
    const steps = parent.find('.resource-value-empty')

    steps.removeClass('active')
    this._assignToActorField(fields, 0)
  }

  _setupButtons(html) {
    const actorData = duplicate(this.actor);
    html.find('.set-pool-personal').each(function (i) {
      if (actorData.system.settings.charmmotepool === 'personal') {
        $(this).css("color", '#F9B516');
      }
    });
    html.find('.set-pool-peripheral').each(function (i) {
      if (actorData.system.settings.charmmotepool === 'peripheral') {
        $(this).css("color", '#F9B516');
      }
    });
  }

  _setupDotCounters(html) {
    const actorData = duplicate(this.actor)
    html.find('.resource-value').each(function () {
      const value = Number(this.dataset.value);
      $(this).find('.resource-value-step').each(function (i) {
        if (i + 1 <= value) {
          $(this).addClass('active');
          $(this).css("background-color", actorData.system.details.color);
        }
      });
    })
    html.find('.resource-value-static').each(function () {
      const value = Number(this.dataset.value)
      $(this).find('.resource-value-static-step').each(function (i) {
        if (i + 1 <= value) {
          $(this).addClass('active');
          $(this).css("background-color", actorData.system.details.color);
        }
      })
    })
  }

  _setupSquareCounters(html) {
    html.find('.resource-counter').each(function () {
      const data = this.dataset;
      const states = parseCounterStates(data.states);

      const halfs = Number(data[states['/']]) || 0;
      const crossed = Number(data[states.x]) || 0;
      const stars = Number(data[states['*']]) || 0;

      const values = new Array(stars + crossed + halfs);

      values.fill('*', 0, stars);
      values.fill('x', stars, stars + crossed);
      values.fill('/', stars + crossed, halfs + crossed + stars);


      $(this).find('.resource-counter-step').each(function () {
        this.dataset.state = ''
        if (this.dataset.index < values.length) {
          this.dataset.state = values[this.dataset.index];
        }
      });
    });
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    event.stopPropagation();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return this.actor.createEmbeddedDocuments("Item", [itemData])
  }

  /**
 * Handle spawning the TraitSelector application which allows a checkbox of multiple trait options
 * @param {Event} event   The click event which originated the selection
 * @private
 */
  _onTraitSelector(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const label = a.parentElement.querySelector("label");
    const choices = CONFIG.exaltedthird[a.dataset.options];
    const options = { name: a.dataset.target, title: label.innerText, choices };
    return new TraitSelector(this.actor, options).render(true)
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.roll) {
      let roll = new Roll(dataset.roll, this.actor.system);
      let label = dataset.label ? `Rolling ${dataset.label}` : '';
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

  async _completeCraft(ev) {
    let li = $(event.currentTarget).parents(".item");
    let item = this.actor.items.get(li.data("item-id"));
    game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'craft', ability: "craft", craftType: item.system.type, craftRating: item.system.rating }).render(true);
  }

  async _displayDataChat(event) {
    let type = $(event.currentTarget).data("type");
    const token = this.actor.token;
    var content = '';
    var title = 'Anima Power';
    switch (type) {
      case "passive":
        content = this.actor.system.anima.passive;
        break;
      case "active":
        content = this.actor.system.anima.active;
        break;
      case "iconic":
        content = this.actor.system.anima.iconic;
        break;
    }
    const templateData = {
      actor: this.actor,
      tokenId: token?.uuid || null,
      content: content,
      title: title,
    };
    const html = await renderTemplate("systems/exaltedthird/templates/chat/exalt-ability-card.html", templateData);

    // Create the ChatMessage data object
    const chatData = {
      user: game.user.id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      speaker: ChatMessage.getSpeaker({ actor: this.actor, token }),
    };


    // Create the Chat Message or return its data
    return ChatMessage.create(chatData);
  }

  /**
* Display the chat card for an Item as a Chat Message
* @param {object} options          Options which configure the display of the item chat card
* @param {string} rollMode         The message visibility mode to apply to the created card
* @param {boolean} createMessage   Whether to automatically create a ChatMessage entity (if true), or only return
*                                  the prepared message data (if false)
*/
  async _displayCard(item, cardType = "") {
    const token = this.actor.token;
    if (cardType === 'Spent' && (item.system.cost?.commitmotes || 0) > 0 || item.system.activatable) {
      if (item.system.active) {
        cardType = "Deactivate";
      }
      else {
        cardType = "Activate";
      }
    }
    const templateData = {
      actor: this.actor,
      tokenId: token?.uuid || null,
      item: item,
      labels: this.labels,
      cardType: cardType,
    };
    const html = await renderTemplate("systems/exaltedthird/templates/chat/item-card.html", templateData);

    // Create the ChatMessage data object
    const chatData = {
      user: game.user.id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      speaker: ChatMessage.getSpeaker({ actor: this.actor, token }),
    };
    // Create the Chat Message or return its data
    return ChatMessage.create(chatData);
  }

  _addOpposingCharm(event) {
    event.preventDefault();
    event.stopPropagation();

    let li = $(event.currentTarget).parents(".item");
    let item = this.actor.items.get(li.data("item-id"));

    if (game.rollForm) {
      game.rollForm.addOpposingCharm(item);
    }

    game.socket.emit('system.exaltedthird', {
      type: 'addOpposingCharm',
      data: item,
      actorId: item.actor._id,
    });
  }

  _spendItem(event) {
    event.preventDefault();
    event.stopPropagation();
    let li = $(event.currentTarget).parents(".item");
    let item = this.actor.items.get(li.data("item-id"));
    spendEmbeddedItem(this.actor, item);
    if (game.settings.get("exaltedthird", "spendChatCards")) {
      this._displayCard(item, "Spent");
    }
  }

  async _lunarSync() {
    const lunar = game.actors.get(this.actor.system.lunarform.actorid);
    if (lunar) {
      const actorData = duplicate(this.actor);

      const template = "systems/exaltedthird/templates/dialogues/lunar-sync.html";
      const html = await renderTemplate(template);
      let confirmed = false;
      new Dialog({
        title: `Lunar Sync`,
        content: html,
        buttons: {
          save: { label: "Sync", callback: () => confirmed = true },
          cancel: { label: "Cancel", callback: () => confirmed = false }
        },
        close: html => {
          if (confirmed) {
            if (actorData.img === 'icons/svg/mystery-man.svg') {
              actorData.img = "systems/exaltedthird/assets/icons/lunar_animal.webp";
            }
            actorData.system.health = lunar.system.health;
            actorData.system.willpower = lunar.system.willpower;
            actorData.system.essence = lunar.system.essence;
            actorData.system.motes = lunar.system.motes;
            actorData.system.resolve = lunar.system.resolve;
            actorData.system.guile = lunar.system.guile;
            actorData.system.anima = lunar.system.anima;
            if (lunar.type === 'npc') {
              actorData.system.appearance.value = actorData.system.appearance.value;
            }
            else {
              actorData.system.appearance.value = lunar.system.attributes.appearance.value;
            }
            actorData.system.evasion.value = Math.max(lunar.system.evasion.value, actorData.system.evasion.value);
            actorData.system.parry.value = Math.max(lunar.system.parry.value, actorData.system.parry.value);
            actorData.system.soak.value = Math.max(lunar.system.soak.value, actorData.system.soak.value);
            actorData.system.armoredsoak.value = Math.max(lunar.system.armoredsoak.value, actorData.system.armoredsoak.value);
            actorData.system.hardness.value = Math.max(lunar.system.hardness.value, actorData.system.hardness.value);
            actorData.system.baseinitiative = lunar.system.baseinitiative;
            actorData.system.details = lunar.system.details;
            actorData.system.creaturetype = 'exalt';

            for (let [key, pool] of Object.entries(actorData.system.pools)) {
              let lunarPool = 0;
              if (lunar.type === 'npc') {
                lunarPool = lunar.system.pools[key].value;
              }
              else {
                if (key === 'grapple') {
                  lunarPool = lunar.system.attributes[lunar.system.settings.rollsettings.grapplecontrol.attribute].value + getCharacterAbilityValue(lunar, lunar.system.settings.rollsettings.grapplecontrol.ability);
                }
                else if (key === 'movement') {
                  lunarPool = lunar.system.attributes[lunar.system.settings.rollsettings.rush.attribute].value + getCharacterAbilityValue(lunar, lunar.system.settings.rollsettings.rush.ability);
                }
                else {
                  lunarPool = lunar.system.attributes[lunar.system.settings.rollsettings[key].attribute].value + getCharacterAbilityValue(lunar, lunar.system.settings.rollsettings[key].ability);
                }
              }

              pool.value = Math.max(pool.value, lunarPool);
            }
            for (let item of this.actor.items.filter(item => item.type === 'action')) {
              if (lunar.type === 'character') {
                if (item.system.lunarstats.attribute !== 'none' && item.system.lunarstats.ability !== 'none') {
                  let lunarActionPool = lunar.system.attributes[item.system.lunarstats.attribute].value + lunar.system.abilities[item.system.lunarstats.ability].value;
                  item.update({
                    [`system.value`]: Math.max(item.system.value, lunarActionPool),
                  });
                }
              }
              else {
                const lunarAction = lunar.items.filter(item => item.type === 'action').find(lunarActionItem => lunarActionItem.name === item.name);
                if (lunarAction) {
                  item.update({
                    [`system.value`]: Math.max(item.system.value, lunarAction.system.value),
                  });
                }
              }
            }

            const newItems = [];
            const newEffects = [];

            for (let item of lunar.items) {
              if ((item.type === 'charm' || item.type === 'spell' || item.type === 'specialty' || item.type === 'ritual' || item.type === 'intimacy') && !this.actor.items.filter(actorItem => actorItem.type === item.type).find(actorItem => actorItem.name === item.name)) {
                newItems.push(duplicate(item));
              }
            }
            for (let effect of lunar.effects) {
              if (!this.actor.effects.find(actorEffect => actorEffect.name === effect.label)) {
                newEffects.push(duplicate(effect));
              }
            }
            if (newItems) {
              this.actor.createEmbeddedDocuments("Item", newItems);
            }
            if (newEffects) {
              this.actor.createEmbeddedDocuments("ActiveEffect", newEffects);
            }
            this.actor.update(actorData);
          }
        }
      }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
    }
    else {
      ui.notifications.error(`<p>Linked Lunar not found</p>`);
    }
  }
}

function getCharacterAbilityValue(actor, ability) {
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


function parseCounterStates(states) {
  return states.split(',').reduce((obj, state) => {
    const [k, v] = state.split(':')
    obj[k] = v
    return obj
  }, {})
}

function isColor(strColor) {
  const s = new Option().style;
  s.color = strColor;
  return s.color !== '';
}
