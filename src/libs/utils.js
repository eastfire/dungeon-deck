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

    var intValue = parseInt(value, 10);
    if (Number.isNaN(intValue)) {
        return false;
    }

    return true;
}

window.isFunction=function(obj){
    return Object.prototype.toString.call(obj) === "[object Function]";
}

window.isString = function(obj){
    return typeof obj == 'string' || obj instanceof String;
}

/*
 * encodeURI replaces each instance of certain characters by one, two, three, or four escape sequences
 * representing the UTF-8 encoding of the character.
 * Each one in the escape sequences is represented in the format of ‘%NN’, where ‘N’ is one Hex number.
 *
 * @return the UTF-8 byte length of a string.
 */
function utf8ByteLength(str) {
    if (!str) return 0;
    var escapedStr = encodeURI(str);
    var match = escapedStr.match(/%/g);
    return match ? (escapedStr.length - match.length *2) : escapedStr.length;
}
/*
 * The method charCodeAt returns the numeric Unicode value of the character at the given index.
 *
 * @return the unicode byte length of a string.
 */
function unicodeByteLength(str) {
    if (!str) return 0;
    var ch;
    var count = 0;
    for ( var i = 0; i < str.length; i++) {
        ch = str.charCodeAt(i);
        do {
            count++;
            ch = ch >> 8; // shift value down by 1 byte
        } while (ch);
    }
    return count;
}
/*
 * The DBSC encodes , like BIG5,GBK , use two bytes to represent a none-ASCII character, which is represented by multiple bytes in Unicode.
 *
 * @return the double-byte character set (DBCS) byte length of a string.
 */
function dbcsByteLength(str) {
    if (!str) return 0;
    var count = 0;
    for ( var i = 0; i < str.length; i++) {
        count++;
        if(str.charCodeAt(i) >> 8) count++;
    }
    return count;
}