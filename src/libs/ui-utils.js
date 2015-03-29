/**
 * Created by 赢潮 on 2015/2/1.
 */
var MyButtonSprite = cc.Sprite.extend({
    ctor: function (fileName, title, fontName, fontSize) {
        this._super(fileName);

        var titleLabel = new cc.LabelTTF(title, fontName, fontSize);
        this.addChild(titleLabel);
        titleLabel.x = this.getContentSize().width / 2;
        titleLabel.y = this.getContentSize().height / 2;
    }
});