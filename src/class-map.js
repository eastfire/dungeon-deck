/**
 * Created by 赢潮 on 2015/3/8.
 */
var DUNGEON_CLASS_MAP = {
    "dark-elf": DarkElfModel,
    dragon: DragonModel,
    ghost: GhostModel,
    lich: LichModel,
    lilith: LilithModel,
    minotaur: MinotaurModel,
    ratman : RatmanModel,
    ooze: OozeModel,
    orc: OrcModel,
    "orc-bandit":OrcBanditModel,
    skeleton : SkeletonModel,
    spider: SpiderModel,
    titan: TitanModel,
    treefolk: TreefolkModel,
    zombie: ZombieModel,

    cyclone: CycloneModel,
    fireball : FireballModel,
    lightening : LighteningModel,
    "magic-missile": MagicMissileModel,
    touchstone: TouchStoneModel,
    "war-drum": WarDrumModel,

    "treasure-chest" : TreasureChestModel,

    blacksmith: BlacksmithModel,
    library: LibraryModel,
    "hen-den": HenDenModel,
    prison: PrisonModel,
    "spoiled-food": SpoiledFoodModel,
    vault: VaultModel,

    "arrow-trap":ArrowTrapModel,
    pitfall: PitfallModel,
    "poison-gas": PoisonGasModel,
    "rolling-boulder": RollingBoulderModel
}

var DUNGEON_SPRITE_CLASS_MAP = {
    "dark-elf": MonsterCardSprite,
    dragon: MonsterCardSprite,
    ghost: MonsterCardSprite,
    lich: MonsterCardSprite,
    lilith: MonsterCardSprite,
    minotaur: MonsterCardSprite,
    ratman : MonsterCardSprite,
    ooze: MonsterCardSprite,
    orc : MonsterCardSprite,
    "orc-bandit" : MonsterCardSprite,
    skeleton : MonsterCardSprite,
    spider: MonsterCardSprite,
    titan: MonsterCardSprite,
    treefolk: MonsterCardSprite,
    zombie: MonsterCardSprite,

    cyclone: SpellCardSprite,
    fireball: FireballCardSprite,
    lightening: SpellCardSprite,
    "magic-missile": MagicMissileCardSprite,
    touchstone: SpellCardSprite,
    "war-drum": WarDrumCardSprite,

    "treasure-chest" : ItemCardSprite,

    blacksmith: RoomCardSprite,
    library: RoomCardSprite,
    "hen-den": RoomCardSprite,
    prison: RoomCardSprite,
    "spoiled-food": RoomCardSprite,
    vault: RoomCardSprite,

    "arrow-trap":TrapCardSprite,
    pitfall:TrapCardSprite,
    "poison-gas":TrapCardSprite,
    "rolling-boulder":TrapCardSprite
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