/**
 * Created by 赢潮 on 2015/3/8.
 */
var DUNGEON_CLASS_MAP = {
    ratman : RatmanModel,
    skeleton : SkeletonModel,

    fireball : FireballModel,
    lightening : LighteningModel,
    "magic-missile": MagicMissileModel,

    "treasure-chest" : TreasureChestModel
}

var DUNGEON_SPRITE_CLASS_MAP = {
    ratman : MonsterCardSprite,
    skeleton : MonsterCardSprite,

    fireball: SpellCardSprite,
    lightening: SpellCardSprite,
    "magic-missile": SpellCardSprite,

    "treasure-chest" : ItemCardSprite
}

