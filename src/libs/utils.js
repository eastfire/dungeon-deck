if ( !Math.log10 ){
    Math.log10 = function(num){
        return Math.log(num)/Math.log(10)
    }
}
if ( !String.prototype.contains ) {
    String.prototype.contains = function(str){
        return this.indexOf(str) > -1;
    }
}
window.clone = function(obj){
    return JSON.parse( JSON.stringify(obj) );
}

window.isInArray = function(array, item){
    for ( var i = 0 ; i < array.length; i++ ){
        if ( array[i] == item )
            return true;
    }
    return false;
}

window.isValidInt = function (value) {
    if (value.length == 0) {
        return false;
    }

    var intValue = parseInt(value);
    if (intValue == Number.NaN) {
        return false;
    }

    return true;
}
