var ScenarioModel = Backbone.Model.extend({
    defaults:function(){
        return {
            name: "",
            description: ""
        }
    },
    getDescription:function(){
        return this.get("description");
    }
});