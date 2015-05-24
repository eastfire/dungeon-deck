/**
 * Created by 赢潮 on 2015/3/8.
 */
var DUNGEON_CLASS_MAP = {
    minotaur: MinotaurModel,
    ratman : RatmanModel,
    ooze: OozeModel,
    orc: OrcModel,
    skeleton : SkeletonModel,

    fireball : FireballModel,
    lightening : LighteningModel,
    "magic-missile": MagicMissileModel,
    "war-drum": WarDrumModel,

    "treasure-chest" : TreasureChestModel,

    vault: VaultModel,
    "hen-den": HenDenModel
}

var DUNGEON_SPRITE_CLASS_MAP = {
    minotaur: MonsterCardSprite,
    ratman : MonsterCardSprite,
    ooze: MonsterCardSprite,
    orc : MonsterCardSprite,
    skeleton : MonsterCardSprite,

    fireball: SpellCardSprite,
    lightening: SpellCardSprite,
    "magic-missile": MagicMissileCardSprite,
    "war-drum": WarDrumCardSprite,

    "treasure-chest" : ItemCardSprite,

    vault: BaseCardSprite,
    "hen-den": BaseCardSprite
}

var CARD_TYPE_MAP = {
    "trap":"陷阱",
    "monster":"怪物",
    "spell":"法术",
    "item":"宝物",
    "room":"设施"
}

var CARD_SUBTYPE_MAP = {
    "undead":"亡灵"
}