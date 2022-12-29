export function registerSettings() {
    game.settings.register('exaltedthird', 'calculateOnslaught', {
        name: game.i18n.localize('Ex3.Onslaught'),
        hint: game.i18n.localize('Ex3.ShowOnslaughtDescription'),
        default: true,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register('exaltedthird', 'defenseOnDamage', {
        name: game.i18n.localize('Ex3.DefenseOnDamage'),
        hint: game.i18n.localize('Ex3.DefenseOnDamageDescription'),
        default: false,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register('exaltedthird', 'autoDecisiveDamage', {
        name: game.i18n.localize('Ex3.AutoDecisiveDamage'),
        hint: game.i18n.localize('Ex3.AutoDecisiveDamageDescription'),
        default: true,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register('exaltedthird', 'animaTokenMagic', {
        name: game.i18n.localize('Ex3.AnimaTokenEffects'),
        hint: game.i18n.localize('Ex3.AnimaTokenEffectsDescription'),
        default: false,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register('exaltedthird', 'attackEffects', {
        name: game.i18n.localize('Ex3.AttackEffects'),
        hint: game.i18n.localize('Ex3.AttackEffectsDescription'),
        default: false,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register("exaltedthird", "systemMigrationVersion", {
        name: "System Migration Version",
        scope: "world",
        config: false,
        type: String,
        default: ""
    });

    game.settings.register("exaltedthird", "flatXP", {
        name: game.i18n.localize('Ex3.FlatXP'),
        hint: game.i18n.localize('Ex3.FlatXPDescription'),
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });
}