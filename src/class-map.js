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

    vault: VaultModel
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

    vault: BaseCardSprite
}

