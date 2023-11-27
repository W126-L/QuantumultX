var CryptoJS=CryptoJS||(function(Math,undefined){var create=Object.create||(function(){function F(){}
return function(obj){var subtype;F.prototype=obj;subtype=new F();F.prototype=null;return subtype;};}())
var C={};var C_lib=C.lib={};var Base=C_lib.Base=(function(){return{extend:function(overrides){var subtype=create(this);if(overrides){subtype.mixIn(overrides);}
if(!subtype.hasOwnProperty('init')||this.init===subtype.init){subtype.init=function(){subtype.$super.init.apply(this,arguments);};}
subtype.init.prototype=subtype;subtype.$super=this;return subtype;},create:function(){var instance=this.extend();instance.init.apply(instance,arguments);return instance;},init:function(){},mixIn:function(properties){for(var propertyName in properties){if(properties.hasOwnProperty(propertyName)){this[propertyName]=properties[propertyName];}}
if(properties.hasOwnProperty('toString')){this.toString=properties.toString;}},clone:function(){return this.init.prototype.extend(this);}};}());var WordArray=C_lib.WordArray=Base.extend({init:function(words,sigBytes){words=this.words=words||[];if(sigBytes!=undefined){this.sigBytes=sigBytes;}else{this.sigBytes=words.length*4;}},toString:function(encoder){return(encoder||Hex).stringify(this);},concat:function(wordArray){var thisWords=this.words;var thatWords=wordArray.words;var thisSigBytes=this.sigBytes;var thatSigBytes=wordArray.sigBytes;this.clamp();if(thisSigBytes%4){for(var i=0;i<thatSigBytes;i++){var thatByte=(thatWords[i>>>2]>>>(24-(i%4)*8))&0xff;thisWords[(thisSigBytes+i)>>>2]|=thatByte<<(24-((thisSigBytes+i)%4)*8);}}else{for(var i=0;i<thatSigBytes;i+=4){thisWords[(thisSigBytes+i)>>>2]=thatWords[i>>>2];}}
this.sigBytes+=thatSigBytes;return this;},clamp:function(){var words=this.words;var sigBytes=this.sigBytes;words[sigBytes>>>2]&=0xffffffff<<(32-(sigBytes%4)*8);words.length=Math.ceil(sigBytes/4);},clone:function(){var clone=Base.clone.call(this);clone.words=this.words.slice(0);return clone;},random:function(nBytes){var words=[];var r=function(m_w){var m_w=m_w;var m_z=0x3ade68b1;var mask=0xffffffff;return function(){m_z=(0x9069*(m_z&0xFFFF)+(m_z>>0x10))&mask;m_w=(0x4650*(m_w&0xFFFF)+(m_w>>0x10))&mask;var result=((m_z<<0x10)+m_w)&mask;result/=0x100000000;result+=0.5;return result*(Math.random()>0.5?1:-1);}};for(var i=0,rcache;i<nBytes;i+=4){var _r=r((rcache||Math.random())*0x100000000);rcache=_r()*0x3ade67b7;words.push((_r()*0x100000000)|0);}
return new WordArray.init(words,nBytes);}});var C_enc=C.enc={};var Hex=C_enc.Hex={stringify:function(wordArray){var words=wordArray.words;var sigBytes=wordArray.sigBytes;var hexChars=[];for(var i=0;i<sigBytes;i++){var bite=(words[i>>>2]>>>(24-(i%4)*8))&0xff;hexChars.push((bite>>>4).toString(16));hexChars.push((bite&0x0f).toString(16));}
return hexChars.join('');},parse:function(hexStr){var hexStrLength=hexStr.length;var words=[];for(var i=0;i<hexStrLength;i+=2){words[i>>>3]|=parseInt(hexStr.substr(i,2),16)<<(24-(i%8)*4);}
return new WordArray.init(words,hexStrLength/2);}};var Latin1=C_enc.Latin1={stringify:function(wordArray){var words=wordArray.words;var sigBytes=wordArray.sigBytes;var latin1Chars=[];for(var i=0;i<sigBytes;i++){var bite=(words[i>>>2]>>>(24-(i%4)*8))&0xff;latin1Chars.push(String.fromCharCode(bite));}
return latin1Chars.join('');},parse:function(latin1Str){var latin1StrLength=latin1Str.length;var words=[];for(var i=0;i<latin1StrLength;i++){words[i>>>2]|=(latin1Str.charCodeAt(i)&0xff)<<(24-(i%4)*8);}
return new WordArray.init(words,latin1StrLength);}};var Utf8=C_enc.Utf8={stringify:function(wordArray){try{return decodeURIComponent(escape(Latin1.stringify(wordArray)));}catch(e){throw new Error('Malformed UTF-8 data');}},parse:function(utf8Str){return Latin1.parse(unescape(encodeURIComponent(utf8Str)));}};var BufferedBlockAlgorithm=C_lib.BufferedBlockAlgorithm=Base.extend({reset:function(){this._data=new WordArray.init();this._nDataBytes=0;},_append:function(data){if(typeof data=='string'){data=Utf8.parse(data);}
this._data.concat(data);this._nDataBytes+=data.sigBytes;},_process:function(doFlush){var processedWords;var data=this._data;var dataWords=data.words;var dataSigBytes=data.sigBytes;var blockSize=this.blockSize;var blockSizeBytes=blockSize*4;var nBlocksReady=dataSigBytes/blockSizeBytes;if(doFlush){nBlocksReady=Math.ceil(nBlocksReady);}else{nBlocksReady=Math.max((nBlocksReady|0)-this._minBufferSize,0);}
var nWordsReady=nBlocksReady*blockSize;var nBytesReady=Math.min(nWordsReady*4,dataSigBytes);if(nWordsReady){for(var offset=0;offset<nWordsReady;offset+=blockSize){this._doProcessBlock(dataWords,offset);}
processedWords=dataWords.splice(0,nWordsReady);data.sigBytes-=nBytesReady;}
return new WordArray.init(processedWords,nBytesReady);},clone:function(){var clone=Base.clone.call(this);clone._data=this._data.clone();return clone;},_minBufferSize:0});var Hasher=C_lib.Hasher=BufferedBlockAlgorithm.extend({cfg:Base.extend(),init:function(cfg){this.cfg=this.cfg.extend(cfg);this.reset();},reset:function(){BufferedBlockAlgorithm.reset.call(this);this._doReset();},update:function(messageUpdate){this._append(messageUpdate);this._process();return this;},finalize:function(messageUpdate){if(messageUpdate){this._append(messageUpdate);}
var hash=this._doFinalize();return hash;},blockSize:512/32,_createHelper:function(hasher){return function(message,cfg){return new hasher.init(cfg).finalize(message);};},_createHmacHelper:function(hasher){return function(message,key){return new C_algo.HMAC.init(hasher,key).finalize(message);};}});var C_algo=C.algo={};return C;}(Math));

(function(){var C=CryptoJS;var C_lib=C.lib;var WordArray=C_lib.WordArray;var C_enc=C.enc;var Base64=C_enc.Base64={stringify:function(wordArray){var words=wordArray.words;var sigBytes=wordArray.sigBytes;var map=this._map;wordArray.clamp();var base64Chars=[];for(var i=0;i<sigBytes;i+=3){var byte1=(words[i>>>2]>>>(24-(i%4)*8))&0xff;var byte2=(words[(i+1)>>>2]>>>(24-((i+1)%4)*8))&0xff;var byte3=(words[(i+2)>>>2]>>>(24-((i+2)%4)*8))&0xff;var triplet=(byte1<<16)|(byte2<<8)|byte3;for(var j=0;(j<4)&&(i+j*0.75<sigBytes);j++){base64Chars.push(map.charAt((triplet>>>(6*(3-j)))&0x3f));}}
var paddingChar=map.charAt(64);if(paddingChar){while(base64Chars.length%4){base64Chars.push(paddingChar);}}
return base64Chars.join('');},parse:function(base64Str){var base64StrLength=base64Str.length;var map=this._map;var reverseMap=this._reverseMap;if(!reverseMap){reverseMap=this._reverseMap=[];for(var j=0;j<map.length;j++){reverseMap[map.charCodeAt(j)]=j;}}
var paddingChar=map.charAt(64);if(paddingChar){var paddingIndex=base64Str.indexOf(paddingChar);if(paddingIndex!==-1){base64StrLength=paddingIndex;}}
return parseLoop(base64Str,base64StrLength,reverseMap);},_map:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='};function parseLoop(base64Str,base64StrLength,reverseMap){var words=[];var nBytes=0;for(var i=0;i<base64StrLength;i++){if(i%4){var bits1=reverseMap[base64Str.charCodeAt(i-1)]<<((i%4)*2);var bits2=reverseMap[base64Str.charCodeAt(i)]>>>(6-(i%4)*2);var bitsCombined=bits1|bits2;words[nBytes>>>2]|=bitsCombined<<(24-(nBytes%4)*8);nBytes++;}}
return WordArray.create(words,nBytes);}}());

CryptoJS.lib.Cipher||(function(undefined){var C=CryptoJS;var C_lib=C.lib;var Base=C_lib.Base;var WordArray=C_lib.WordArray;var BufferedBlockAlgorithm=C_lib.BufferedBlockAlgorithm;var C_enc=C.enc;var Utf8=C_enc.Utf8;var Base64=C_enc.Base64;var C_algo=C.algo;var EvpKDF=C_algo.EvpKDF;var Cipher=C_lib.Cipher=BufferedBlockAlgorithm.extend({cfg:Base.extend(),createEncryptor:function(key,cfg){return this.create(this._ENC_XFORM_MODE,key,cfg);},createDecryptor:function(key,cfg){return this.create(this._DEC_XFORM_MODE,key,cfg);},init:function(xformMode,key,cfg){this.cfg=this.cfg.extend(cfg);this._xformMode=xformMode;this._key=key;this.reset();},reset:function(){BufferedBlockAlgorithm.reset.call(this);this._doReset();},process:function(dataUpdate){this._append(dataUpdate);return this._process();},finalize:function(dataUpdate){if(dataUpdate){this._append(dataUpdate);}
var finalProcessedData=this._doFinalize();return finalProcessedData;},keySize:128/32,ivSize:128/32,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:(function(){function selectCipherStrategy(key){if(typeof key=='string'){return PasswordBasedCipher;}else{return SerializableCipher;}}
return function(cipher){return{encrypt:function(message,key,cfg){return selectCipherStrategy(key).encrypt(cipher,message,key,cfg);},decrypt:function(ciphertext,key,cfg){return selectCipherStrategy(key).decrypt(cipher,ciphertext,key,cfg);}};};}())});var StreamCipher=C_lib.StreamCipher=Cipher.extend({_doFinalize:function(){var finalProcessedBlocks=this._process(!!'flush');return finalProcessedBlocks;},blockSize:1});var C_mode=C.mode={};var BlockCipherMode=C_lib.BlockCipherMode=Base.extend({createEncryptor:function(cipher,iv){return this.Encryptor.create(cipher,iv);},createDecryptor:function(cipher,iv){return this.Decryptor.create(cipher,iv);},init:function(cipher,iv){this._cipher=cipher;this._iv=iv;}});var CBC=C_mode.CBC=(function(){var CBC=BlockCipherMode.extend();CBC.Encryptor=CBC.extend({processBlock:function(words,offset){var cipher=this._cipher;var blockSize=cipher.blockSize;xorBlock.call(this,words,offset,blockSize);cipher.encryptBlock(words,offset);this._prevBlock=words.slice(offset,offset+blockSize);}});CBC.Decryptor=CBC.extend({processBlock:function(words,offset){var cipher=this._cipher;var blockSize=cipher.blockSize;var thisBlock=words.slice(offset,offset+blockSize);cipher.decryptBlock(words,offset);xorBlock.call(this,words,offset,blockSize);this._prevBlock=thisBlock;}});function xorBlock(words,offset,blockSize){var block;var iv=this._iv;if(iv){block=iv;this._iv=undefined;}else{block=this._prevBlock;}
for(var i=0;i<blockSize;i++){words[offset+i]^=block[i];}}
return CBC;}());var C_pad=C.pad={};var Pkcs7=C_pad.Pkcs7={pad:function(data,blockSize){var blockSizeBytes=blockSize*4;var nPaddingBytes=blockSizeBytes-data.sigBytes%blockSizeBytes;var paddingWord=(nPaddingBytes<<24)|(nPaddingBytes<<16)|(nPaddingBytes<<8)|nPaddingBytes;var paddingWords=[];for(var i=0;i<nPaddingBytes;i+=4){paddingWords.push(paddingWord);}
var padding=WordArray.create(paddingWords,nPaddingBytes);data.concat(padding);},unpad:function(data){var nPaddingBytes=data.words[(data.sigBytes-1)>>>2]&0xff;data.sigBytes-=nPaddingBytes;}};var BlockCipher=C_lib.BlockCipher=Cipher.extend({cfg:Cipher.cfg.extend({mode:CBC,padding:Pkcs7}),reset:function(){var modeCreator;Cipher.reset.call(this);var cfg=this.cfg;var iv=cfg.iv;var mode=cfg.mode;if(this._xformMode==this._ENC_XFORM_MODE){modeCreator=mode.createEncryptor;}else{modeCreator=mode.createDecryptor;this._minBufferSize=1;}
if(this._mode&&this._mode.__creator==modeCreator){this._mode.init(this,iv&&iv.words);}else{this._mode=modeCreator.call(mode,this,iv&&iv.words);this._mode.__creator=modeCreator;}},_doProcessBlock:function(words,offset){this._mode.processBlock(words,offset);},_doFinalize:function(){var finalProcessedBlocks;var padding=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){padding.pad(this._data,this.blockSize);finalProcessedBlocks=this._process(!!'flush');}else{finalProcessedBlocks=this._process(!!'flush');padding.unpad(finalProcessedBlocks);}
return finalProcessedBlocks;},blockSize:128/32});var CipherParams=C_lib.CipherParams=Base.extend({init:function(cipherParams){this.mixIn(cipherParams);},toString:function(formatter){return(formatter||this.formatter).stringify(this);}});var C_format=C.format={};var OpenSSLFormatter=C_format.OpenSSL={stringify:function(cipherParams){var wordArray;var ciphertext=cipherParams.ciphertext;var salt=cipherParams.salt;if(salt){wordArray=WordArray.create([0x53616c74,0x65645f5f]).concat(salt).concat(ciphertext);}else{wordArray=ciphertext;}
return wordArray.toString(Base64);},parse:function(openSSLStr){var salt;var ciphertext=Base64.parse(openSSLStr);var ciphertextWords=ciphertext.words;if(ciphertextWords[0]==0x53616c74&&ciphertextWords[1]==0x65645f5f){salt=WordArray.create(ciphertextWords.slice(2,4));ciphertextWords.splice(0,4);ciphertext.sigBytes-=16;}
return CipherParams.create({ciphertext:ciphertext,salt:salt});}};var SerializableCipher=C_lib.SerializableCipher=Base.extend({cfg:Base.extend({format:OpenSSLFormatter}),encrypt:function(cipher,message,key,cfg){cfg=this.cfg.extend(cfg);var encryptor=cipher.createEncryptor(key,cfg);var ciphertext=encryptor.finalize(message);var cipherCfg=encryptor.cfg;return CipherParams.create({ciphertext:ciphertext,key:key,iv:cipherCfg.iv,algorithm:cipher,mode:cipherCfg.mode,padding:cipherCfg.padding,blockSize:cipher.blockSize,formatter:cfg.format});},decrypt:function(cipher,ciphertext,key,cfg){cfg=this.cfg.extend(cfg);ciphertext=this._parse(ciphertext,cfg.format);var plaintext=cipher.createDecryptor(key,cfg).finalize(ciphertext.ciphertext);return plaintext;},_parse:function(ciphertext,format){if(typeof ciphertext=='string'){return format.parse(ciphertext,this);}else{return ciphertext;}}});var C_kdf=C.kdf={};var OpenSSLKdf=C_kdf.OpenSSL={execute:function(password,keySize,ivSize,salt){if(!salt){salt=WordArray.random(64/8);}
var key=EvpKDF.create({keySize:keySize+ivSize}).compute(password,salt);var iv=WordArray.create(key.words.slice(keySize),ivSize*4);key.sigBytes=keySize*4;return CipherParams.create({key:key,iv:iv,salt:salt});}};var PasswordBasedCipher=C_lib.PasswordBasedCipher=SerializableCipher.extend({cfg:SerializableCipher.cfg.extend({kdf:OpenSSLKdf}),encrypt:function(cipher,message,password,cfg){cfg=this.cfg.extend(cfg);var derivedParams=cfg.kdf.execute(password,cipher.keySize,cipher.ivSize);cfg.iv=derivedParams.iv;var ciphertext=SerializableCipher.encrypt.call(this,cipher,message,derivedParams.key,cfg);ciphertext.mixIn(derivedParams);return ciphertext;},decrypt:function(cipher,ciphertext,password,cfg){cfg=this.cfg.extend(cfg);ciphertext=this._parse(ciphertext,cfg.format);var derivedParams=cfg.kdf.execute(password,cipher.keySize,cipher.ivSize,ciphertext.salt);cfg.iv=derivedParams.iv;var plaintext=SerializableCipher.decrypt.call(this,cipher,ciphertext,derivedParams.key,cfg);return plaintext;}});}());

(function(){var C=CryptoJS;var C_lib=C.lib;var BlockCipher=C_lib.BlockCipher;var C_algo=C.algo;var SBOX=[];var INV_SBOX=[];var SUB_MIX_0=[];var SUB_MIX_1=[];var SUB_MIX_2=[];var SUB_MIX_3=[];var INV_SUB_MIX_0=[];var INV_SUB_MIX_1=[];var INV_SUB_MIX_2=[];var INV_SUB_MIX_3=[];(function(){var d=[];for(var i=0;i<256;i++){if(i<128){d[i]=i<<1;}else{d[i]=(i<<1)^0x11b;}}
var x=0;var xi=0;for(var i=0;i<256;i++){var sx=xi^(xi<<1)^(xi<<2)^(xi<<3)^(xi<<4);sx=(sx>>>8)^(sx&0xff)^0x63;SBOX[x]=sx;INV_SBOX[sx]=x;var x2=d[x];var x4=d[x2];var x8=d[x4];var t=(d[sx]*0x101)^(sx*0x1010100);SUB_MIX_0[x]=(t<<24)|(t>>>8);SUB_MIX_1[x]=(t<<16)|(t>>>16);SUB_MIX_2[x]=(t<<8)|(t>>>24);SUB_MIX_3[x]=t;var t=(x8*0x1010101)^(x4*0x10001)^(x2*0x101)^(x*0x1010100);INV_SUB_MIX_0[sx]=(t<<24)|(t>>>8);INV_SUB_MIX_1[sx]=(t<<16)|(t>>>16);INV_SUB_MIX_2[sx]=(t<<8)|(t>>>24);INV_SUB_MIX_3[sx]=t;if(!x){x=xi=1;}else{x=x2^d[d[d[x8^x2]]];xi^=d[d[xi]];}}}());var RCON=[0x00,0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36];var AES=C_algo.AES=BlockCipher.extend({_doReset:function(){var t;if(this._nRounds&&this._keyPriorReset===this._key){return;}
var key=this._keyPriorReset=this._key;var keyWords=key.words;var keySize=key.sigBytes/4;var nRounds=this._nRounds=keySize+6;var ksRows=(nRounds+1)*4;var keySchedule=this._keySchedule=[];for(var ksRow=0;ksRow<ksRows;ksRow++){if(ksRow<keySize){keySchedule[ksRow]=keyWords[ksRow];}else{t=keySchedule[ksRow-1];if(!(ksRow%keySize)){t=(t<<8)|(t>>>24);t=(SBOX[t>>>24]<<24)|(SBOX[(t>>>16)&0xff]<<16)|(SBOX[(t>>>8)&0xff]<<8)|SBOX[t&0xff];t^=RCON[(ksRow/keySize)|0]<<24;}else if(keySize>6&&ksRow%keySize==4){t=(SBOX[t>>>24]<<24)|(SBOX[(t>>>16)&0xff]<<16)|(SBOX[(t>>>8)&0xff]<<8)|SBOX[t&0xff];}
keySchedule[ksRow]=keySchedule[ksRow-keySize]^t;}}
var invKeySchedule=this._invKeySchedule=[];for(var invKsRow=0;invKsRow<ksRows;invKsRow++){var ksRow=ksRows-invKsRow;if(invKsRow%4){var t=keySchedule[ksRow];}else{var t=keySchedule[ksRow-4];}
if(invKsRow<4||ksRow<=4){invKeySchedule[invKsRow]=t;}else{invKeySchedule[invKsRow]=INV_SUB_MIX_0[SBOX[t>>>24]]^INV_SUB_MIX_1[SBOX[(t>>>16)&0xff]]^INV_SUB_MIX_2[SBOX[(t>>>8)&0xff]]^INV_SUB_MIX_3[SBOX[t&0xff]];}}},encryptBlock:function(M,offset){this._doCryptBlock(M,offset,this._keySchedule,SUB_MIX_0,SUB_MIX_1,SUB_MIX_2,SUB_MIX_3,SBOX);},decryptBlock:function(M,offset){var t=M[offset+1];M[offset+1]=M[offset+3];M[offset+3]=t;this._doCryptBlock(M,offset,this._invKeySchedule,INV_SUB_MIX_0,INV_SUB_MIX_1,INV_SUB_MIX_2,INV_SUB_MIX_3,INV_SBOX);var t=M[offset+1];M[offset+1]=M[offset+3];M[offset+3]=t;},_doCryptBlock:function(M,offset,keySchedule,SUB_MIX_0,SUB_MIX_1,SUB_MIX_2,SUB_MIX_3,SBOX){var nRounds=this._nRounds;var s0=M[offset]^keySchedule[0];var s1=M[offset+1]^keySchedule[1];var s2=M[offset+2]^keySchedule[2];var s3=M[offset+3]^keySchedule[3];var ksRow=4;for(var round=1;round<nRounds;round++){var t0=SUB_MIX_0[s0>>>24]^SUB_MIX_1[(s1>>>16)&0xff]^SUB_MIX_2[(s2>>>8)&0xff]^SUB_MIX_3[s3&0xff]^keySchedule[ksRow++];var t1=SUB_MIX_0[s1>>>24]^SUB_MIX_1[(s2>>>16)&0xff]^SUB_MIX_2[(s3>>>8)&0xff]^SUB_MIX_3[s0&0xff]^keySchedule[ksRow++];var t2=SUB_MIX_0[s2>>>24]^SUB_MIX_1[(s3>>>16)&0xff]^SUB_MIX_2[(s0>>>8)&0xff]^SUB_MIX_3[s1&0xff]^keySchedule[ksRow++];var t3=SUB_MIX_0[s3>>>24]^SUB_MIX_1[(s0>>>16)&0xff]^SUB_MIX_2[(s1>>>8)&0xff]^SUB_MIX_3[s2&0xff]^keySchedule[ksRow++];s0=t0;s1=t1;s2=t2;s3=t3;}
var t0=((SBOX[s0>>>24]<<24)|(SBOX[(s1>>>16)&0xff]<<16)|(SBOX[(s2>>>8)&0xff]<<8)|SBOX[s3&0xff])^keySchedule[ksRow++];var t1=((SBOX[s1>>>24]<<24)|(SBOX[(s2>>>16)&0xff]<<16)|(SBOX[(s3>>>8)&0xff]<<8)|SBOX[s0&0xff])^keySchedule[ksRow++];var t2=((SBOX[s2>>>24]<<24)|(SBOX[(s3>>>16)&0xff]<<16)|(SBOX[(s0>>>8)&0xff]<<8)|SBOX[s1&0xff])^keySchedule[ksRow++];var t3=((SBOX[s3>>>24]<<24)|(SBOX[(s0>>>16)&0xff]<<16)|(SBOX[(s1>>>8)&0xff]<<8)|SBOX[s2&0xff])^keySchedule[ksRow++];M[offset]=t0;M[offset+1]=t1;M[offset+2]=t2;M[offset+3]=t3;},keySize:256/32});C.AES=BlockCipher._createHelper(AES);}());

(function(Math){var C=CryptoJS;var C_lib=C.lib;var WordArray=C_lib.WordArray;var Hasher=C_lib.Hasher;var C_algo=C.algo;var T=[];(function(){for(var i=0;i<64;i++){T[i]=(Math.abs(Math.sin(i+1))*0x100000000)|0;}}());var MD5=C_algo.MD5=Hasher.extend({_doReset:function(){this._hash=new WordArray.init([0x67452301,0xefcdab89,0x98badcfe,0x10325476]);},_doProcessBlock:function(M,offset){for(var i=0;i<16;i++){var offset_i=offset+i;var M_offset_i=M[offset_i];M[offset_i]=((((M_offset_i<<8)|(M_offset_i>>>24))&0x00ff00ff)|(((M_offset_i<<24)|(M_offset_i>>>8))&0xff00ff00));}
var H=this._hash.words;var M_offset_0=M[offset+0];var M_offset_1=M[offset+1];var M_offset_2=M[offset+2];var M_offset_3=M[offset+3];var M_offset_4=M[offset+4];var M_offset_5=M[offset+5];var M_offset_6=M[offset+6];var M_offset_7=M[offset+7];var M_offset_8=M[offset+8];var M_offset_9=M[offset+9];var M_offset_10=M[offset+10];var M_offset_11=M[offset+11];var M_offset_12=M[offset+12];var M_offset_13=M[offset+13];var M_offset_14=M[offset+14];var M_offset_15=M[offset+15];var a=H[0];var b=H[1];var c=H[2];var d=H[3];a=FF(a,b,c,d,M_offset_0,7,T[0]);d=FF(d,a,b,c,M_offset_1,12,T[1]);c=FF(c,d,a,b,M_offset_2,17,T[2]);b=FF(b,c,d,a,M_offset_3,22,T[3]);a=FF(a,b,c,d,M_offset_4,7,T[4]);d=FF(d,a,b,c,M_offset_5,12,T[5]);c=FF(c,d,a,b,M_offset_6,17,T[6]);b=FF(b,c,d,a,M_offset_7,22,T[7]);a=FF(a,b,c,d,M_offset_8,7,T[8]);d=FF(d,a,b,c,M_offset_9,12,T[9]);c=FF(c,d,a,b,M_offset_10,17,T[10]);b=FF(b,c,d,a,M_offset_11,22,T[11]);a=FF(a,b,c,d,M_offset_12,7,T[12]);d=FF(d,a,b,c,M_offset_13,12,T[13]);c=FF(c,d,a,b,M_offset_14,17,T[14]);b=FF(b,c,d,a,M_offset_15,22,T[15]);a=GG(a,b,c,d,M_offset_1,5,T[16]);d=GG(d,a,b,c,M_offset_6,9,T[17]);c=GG(c,d,a,b,M_offset_11,14,T[18]);b=GG(b,c,d,a,M_offset_0,20,T[19]);a=GG(a,b,c,d,M_offset_5,5,T[20]);d=GG(d,a,b,c,M_offset_10,9,T[21]);c=GG(c,d,a,b,M_offset_15,14,T[22]);b=GG(b,c,d,a,M_offset_4,20,T[23]);a=GG(a,b,c,d,M_offset_9,5,T[24]);d=GG(d,a,b,c,M_offset_14,9,T[25]);c=GG(c,d,a,b,M_offset_3,14,T[26]);b=GG(b,c,d,a,M_offset_8,20,T[27]);a=GG(a,b,c,d,M_offset_13,5,T[28]);d=GG(d,a,b,c,M_offset_2,9,T[29]);c=GG(c,d,a,b,M_offset_7,14,T[30]);b=GG(b,c,d,a,M_offset_12,20,T[31]);a=HH(a,b,c,d,M_offset_5,4,T[32]);d=HH(d,a,b,c,M_offset_8,11,T[33]);c=HH(c,d,a,b,M_offset_11,16,T[34]);b=HH(b,c,d,a,M_offset_14,23,T[35]);a=HH(a,b,c,d,M_offset_1,4,T[36]);d=HH(d,a,b,c,M_offset_4,11,T[37]);c=HH(c,d,a,b,M_offset_7,16,T[38]);b=HH(b,c,d,a,M_offset_10,23,T[39]);a=HH(a,b,c,d,M_offset_13,4,T[40]);d=HH(d,a,b,c,M_offset_0,11,T[41]);c=HH(c,d,a,b,M_offset_3,16,T[42]);b=HH(b,c,d,a,M_offset_6,23,T[43]);a=HH(a,b,c,d,M_offset_9,4,T[44]);d=HH(d,a,b,c,M_offset_12,11,T[45]);c=HH(c,d,a,b,M_offset_15,16,T[46]);b=HH(b,c,d,a,M_offset_2,23,T[47]);a=II(a,b,c,d,M_offset_0,6,T[48]);d=II(d,a,b,c,M_offset_7,10,T[49]);c=II(c,d,a,b,M_offset_14,15,T[50]);b=II(b,c,d,a,M_offset_5,21,T[51]);a=II(a,b,c,d,M_offset_12,6,T[52]);d=II(d,a,b,c,M_offset_3,10,T[53]);c=II(c,d,a,b,M_offset_10,15,T[54]);b=II(b,c,d,a,M_offset_1,21,T[55]);a=II(a,b,c,d,M_offset_8,6,T[56]);d=II(d,a,b,c,M_offset_15,10,T[57]);c=II(c,d,a,b,M_offset_6,15,T[58]);b=II(b,c,d,a,M_offset_13,21,T[59]);a=II(a,b,c,d,M_offset_4,6,T[60]);d=II(d,a,b,c,M_offset_11,10,T[61]);c=II(c,d,a,b,M_offset_2,15,T[62]);b=II(b,c,d,a,M_offset_9,21,T[63]);H[0]=(H[0]+a)|0;H[1]=(H[1]+b)|0;H[2]=(H[2]+c)|0;H[3]=(H[3]+d)|0;},_doFinalize:function(){var data=this._data;var dataWords=data.words;var nBitsTotal=this._nDataBytes*8;var nBitsLeft=data.sigBytes*8;dataWords[nBitsLeft>>>5]|=0x80<<(24-nBitsLeft%32);var nBitsTotalH=Math.floor(nBitsTotal/0x100000000);var nBitsTotalL=nBitsTotal;dataWords[(((nBitsLeft+64)>>>9)<<4)+15]=((((nBitsTotalH<<8)|(nBitsTotalH>>>24))&0x00ff00ff)|(((nBitsTotalH<<24)|(nBitsTotalH>>>8))&0xff00ff00));dataWords[(((nBitsLeft+64)>>>9)<<4)+14]=((((nBitsTotalL<<8)|(nBitsTotalL>>>24))&0x00ff00ff)|(((nBitsTotalL<<24)|(nBitsTotalL>>>8))&0xff00ff00));data.sigBytes=(dataWords.length+1)*4;this._process();var hash=this._hash;var H=hash.words;for(var i=0;i<4;i++){var H_i=H[i];H[i]=(((H_i<<8)|(H_i>>>24))&0x00ff00ff)|(((H_i<<24)|(H_i>>>8))&0xff00ff00);}
return hash;},clone:function(){var clone=Hasher.clone.call(this);clone._hash=this._hash.clone();return clone;}});function FF(a,b,c,d,x,s,t){var n=a+((b&c)|(~b&d))+x+t;return((n<<s)|(n>>>(32-s)))+b;}
function GG(a,b,c,d,x,s,t){var n=a+((b&d)|(c&~d))+x+t;return((n<<s)|(n>>>(32-s)))+b;}
function HH(a,b,c,d,x,s,t){var n=a+(b^c^d)+x+t;return((n<<s)|(n>>>(32-s)))+b;}
function II(a,b,c,d,x,s,t){var n=a+(c^(b|~d))+x+t;return((n<<s)|(n>>>(32-s)))+b;}
C.MD5=Hasher._createHelper(MD5);C.HmacMD5=Hasher._createHmacHelper(MD5);}(Math));

function secret(string, code, operation) {
  code = CryptoJS.MD5(code).toString();
  var iv = CryptoJS.enc.Utf8.parse(code.substring(0, 16));
  var key = CryptoJS.enc.Utf8.parse(code.substring(16));
  if (operation) {
    return CryptoJS.AES.decrypt(
        string,
        key,
        {iv: iv, padding: CryptoJS.pad.Pkcs7}
    ).toString(CryptoJS.enc.Utf8);
  }
  return CryptoJS.AES.encrypt(string, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
}

const fonts = {"&#xe800":"的","&#xe801":"一","&#xe802":"是","&#xe803":"了","&#xe804":"我","&#xe805":"不","&#xe806":"人", "&#xe807":"在","&#xe808":"他","&#xe809":"有","&#xe80a":"这","&#xe80b":"个","&#xe80c":"上","&#xe80d":"们","&#xe80e":"来","&#xe80f":"到","&#xe810":"时","&#xe811":"大","&#xe812":"地","&#xe813":"为","&#xe814":"子","&#xe815":"中","&#xe816":"你","&#xe817":"说","&#xe818":"生","&#xe819":"国","&#xe81a":"年","&#xe81b":"着","&#xe81c":"就","&#xe81d":"那","&#xe81e":"和","&#xe81f":"要","&#xe820":"她","&#xe821":"出","&#xe822":"也","&#xe823":"得","&#xe824":"里","&#xe825":"后","&#xe826":"自","&#xe827":"以","&#xe828":"会","&#xe829":"家","&#xe82a":"可","&#xe82b":"下","&#xe82c":"而","&#xe82d":"过","&#xe82e":"天","&#xe82f":"去","&#xe830":"能","&#xe831":"对","&#xe832":"小","&#xe833":"多","&#xe834":"然","&#xe835":"于","&#xe836":"心","&#xe837":"学","&#xe838":"么","&#xe839":"之","&#xe83a":"都","&#xe83b":"好","&#xe83c":"看","&#xe83d":"起","&#xe83e":"发","&#xe83f":"当","&#xe840":"没","&#xe841":"成","&#xe842":"只","&#xe843":"如","&#xe844":"事","&#xe845":"把","&#xe846":"还","&#xe847":"用","&#xe848":"第","&#xe849":"样","&#xe84a":"道","&#xe84b":"想","&#xe84c":"作","&#xe84d":"种","&#xe84e":"开","&#xe84f":"美","&#xe850":"总","&#xe851":"从","&#xe852":"无","&#xe853":"情","&#xe854":"己","&#xe855":"面","&#xe856":"最","&#xe857":"女","&#xe858":"但","&#xe859":"现","&#xe85a":"前","&#xe85b":"些","&#xe85c":"所","&#xe85d":"同","&#xe85e":"日","&#xe85f":"手","&#xe860":"又","&#xe861":"行","&#xe862":"意","&#xe863":"动"}

  let f = (content) => {
    content = content.replaceAll(/&#xe[\da-f]+/g, function (a, b) {
      return fonts[a];
    });
    return content;
    if (!content) {
      return content
    }
    return content.replaceAll(/<[^>]*>/g, '').replaceAll(/\n\n\n\n/g, '\n').replaceAll(/\n\n/g, '').trim();
  }

  let findNextUrl = (html, currUrl) => {//下一页
    let nextHref = null;

    let pagesMatches = html.match(/<center class="chapterPages">(.*)<\/center>/s)

    if (pagesMatches?.length === 2) {
      let pages = pagesMatches[1];
      pages = pages.split('</a><a');
      let currIndex = pages.findIndex(elem => {
        return elem.indexOf('curr') !== -1
      })
      if (currIndex < pages.length - 1 && currIndex >= 0) {
        nextHref = pages[currIndex + 1]
        let hrefMatches = nextHref.match(/href="(.*)?"/);

        if (hrefMatches.length === 2) {
          nextHref = hrefMatches[1]
          if (nextHref.indexOf('javascript:') === 0) {
            let jsMatches = nextHref.match(/javascript:.*\('\d+','\d+','(\d+)','(\d+)'\);/i);
            if (jsMatches.length === 3) {
              nextHref = jsMatches[1] + '_' + jsMatches[2] + '.html'
            }
          }
        }
      }
    }
    if (nextHref) {
      const splitCurrUrls = currUrl.split('/');
      splitCurrUrls[splitCurrUrls.length - 1] = nextHref
      return splitCurrUrls.join('/')
    }

    if (pagesMatches) {
      return null;
    }

    const nextUrl = currUrl.replace(/(\/\d+_)(\d+)(.html)$/g, function (match, p1, p2, p3, offset, str) {
      return p1 + (parseInt(p2) + 1) + p3
    })
    return nextUrl
  }

  const imgMaps = { "5604308767.png": "情", "6457819129.png": "嫡", "1250302.png": "锡", "0271250302.png": "锡", "0117530724.png": "棍", "0203769080.png": "丰", "0230924173.png": "共", "0355171744.png": "地", "0528649589.png": "臀", "0602771294.png": "妈", "0665756424.png": "胸", "0665889261.png": "蛋", "0682651127.png": "酸", "0689040939.png": "炸", "0698278491.png": "首", "0744208851.png": "一", "0747467933.png": "蜜", "0774208243.png": "介", "0817898144.png": "民", "0832215510.png": "合", "0835270647.png": "八", "0872283620.png": "泽", "0902364778.png": "十", "0902772900.png": "春", "0951783242.png": "露", "0983658750.png": "香", "0990372354.png": "淫", "1019435523.png": "胡", "1020382214.png": "三", "1128608327.png": "偷", "1165271020.png": "暴", "1167260777.png": "腿", "1190111324.png": "第", "1330289459.png": "丝", "1527556132.png": "元", "1605992686.png": "件", "1644155001.png": "腐", "1689714497.png": "吟", "1690746609.png": "义", "1748611635.png": "炮", "1790668606.png": "高", "1809149563.png": "含", "2038870549.png": "爱", "2113285564.png": "死", "2116155892.png": "妇", "2148844516.png": "茎", "2211806946.png": "人", "2222207117.png": "嫩", "2346301295.png": "部", "2444390640.png": "弟", "2472677945.png": "马", "2479341369.png": "帮", "2508447790.png": "骚", "2537989817.png": "党", "2546160883.png": "上", "2572476976.png": "涛", "2610770243.png": "坑", "2624694117.png": "缝", "2660141736.png": "亡", "2676668403.png": "虐", "2735853814.png": "独", "2757781217.png": "妓", "2791601284.png": "枪", "2825234303.png": "版", "2845054079.png": "漪", "2857703127.png": "法", "2876804651.png": "顶", "2885608989.png": "中", "2886155750.png": "棒", "2953530793.png": "花", "3023538105.png": "席", "3028548732.png": "逼", "3087672465.png": "五", "3187883344.png": "园", "3236560627.png": "胎", "3269935019.png": "光", "3511096181.png": "摇", "3518213323.png": "勃", "3561353475.png": "眼", "3573763138.png": "最", "3609388116.png": "乱", "3620919708.png": "宰", "3691658535.png": "做", "3697158622.png": "主", "3734280203.png": "毛", "3750225803.png": "交", "3835404789.png": "大", "3887706975.png": "温", "3891562379.png": "斩", "3916380979.png": "鹏", "4072862874.png": "吞", "4207051000.png": "嫂", "4208731327.png": "未", "4247282819.png": "潮", "4323477214.png": "发", "4426733800.png": "秽", "4465328127.png": "六", "4852882191.png": "妊", "4896650341.png": "色", "4915941086.png": "西", "4973271227.png": "呻", "5034321418.png": "流", "5067461841.png": "菊", "5091848517.png": "幼", "5111229895.png": "奸", "5118765982.png": "网", "5119090656.png": "灭", "5219037129.png": "搞", "5241270215.png": "址", "5268319798.png": "房", "5366920169.png": "干", "5385687355.png": "药", "5405095624.png": "活", "5504072831.png": "裸", "5515430018.png": "妹", "5554918885.png": "夫", "5570002531.png": "粉", "5637260964.png": "轮", "5738418978.png": "氓", "5794932762.png": "巴", "5798715549.png": "山", "5825662041.png": "白", "5865212886.png": "里", "5909889921.png": "伦", "5934682064.png": "二", "5958823569.png": "麻", "6115586454.png": "吸", "6143300813.png": "咪", "6146409280.png": "粗", "6198192490.png": "童", "6202025318.png": "代", "6258129695.png": "欲", "6325155879.png": "奶", "6338842694.png": "排", "6445315584.png": "肛", "6472284406.png": "辱", "6534980771.png": "台", "6598183488.png": "弹", "6695148880.png": "美", "6695940412.png": "锦", "6810021581.png": "熟", "6813919707.png": "纪", "6834531826.png": "尿", "6843073930.png": "指", "6874325047.png": "操", "6921916056.png": "龟", "6972560942.png": "亲", "7071132422.png": "湿", "7075168225.png": "穴", "7092415778.png": "头", "7118332370.png": "贱", "7227745529.png": "奴", "7334347774.png": "玉", "7366713478.png": "买", "7373168399.png": "办", "7402244018.png": "宫", "7406513426.png": "毒", "7450445747.png": "挤", "7478986526.png": "鸡", "7614763772.png": "水", "7615188907.png": "天", "7641707176.png": "甲", "7645727085.png": "私", "7666628481.png": "学", "7801094435.png": "阴", "7808420336.png": "荡", "7873389278.png": "朱", "7875951963.png": "四", "7902010953.png": "九", "7912251525.png": "舔", "7971728127.png": "杜", "7980237169.png": "内", "8001980049.png": "国", "8165804057.png": "母", "8186728471.png": "出", "8202714140.png": "东", "8212084865.png": "屁", "8242185966.png": "动", "8285637025.png": "容", "8381351178.png": "具", "8406787204.png": "退", "8431104929.png": "舌", "8431794980.png": "唇", "8443857439.png": "插", "8482091824.png": "江", "8519707329.png": "杀", "8553796321.png": "户", "8637348340.png": "精", "8728327662.png": "乳", "8739167787.png": "处", "8770568739.png": "肉", "8771907310.png": "狗", "8773645769.png": "情", "8986539842.png": "证", "9030340049.png": "性", "9065740329.png": "射", "9073248466.png": "血", "9075956636.png": "迷", "9100236271.png": "兽", "9123535704.png": "洞", "9131928994.png": "硬", "9218945420.png": "波", "9312787093.png": "七", "9332720497.png": "足", "9350080768.png": "下", "9364129810.png": "丁", "9386124353.png": "儿", "9440082131.png": "生", "9480765147.png": "厥", "9572922210.png": "布", "9633654504.png": "公", "9818286580.png": "扎", "9875422061.png": "凌", "9884662704.png": "撸", "9934161012.png": "婊", "9942269763.png": "浪", "9986630664.png": "漏", "9993921948.png": "局", "a85090415a.png": "日" };


var result = $response.body
var urls = $request
var ck = urls.headers["Cookie"]
var ua = urls.headers["User-Agent"]
urls = urls.url




  let beginStr = '<div id="chapterinfo">';
  let beginIndex = result.indexOf(beginStr);
  if (beginIndex > 0) { // 顺序 无图片替换
    let subStr = result.substr(beginIndex + beginStr.length);
    let endIndex = subStr.indexOf('</div>');
    let tarStr = subStr.substr(0, endIndex);
let con = `
${f(tarStr)}</div><a href="${findNextUrl(result,urls)}">下一页</a>`

$done(con)
/*
return {
      content: f(tarStr),
      'removeHtmlKeys': 'content',
      autoRequestMore: true,
      nextUrl: findNextUrl(result, params.responseUrl),
      nextParams: {}
    };
*/
  }

  beginStr = 'var chapter = secret(';
  beginIndex = result.indexOf(beginStr);
  if (beginIndex > 0) { // AES加密
    let subStr = result.substr(beginIndex + beginStr.length);
    let endIndex = subStr.indexOf(');');
    let tarStr = subStr.substr(0, endIndex);
    tarStr = tarStr.replace(/\s+/g, "")
    let matches = tarStr.match(/"(.*)".*'(.*)'/);

    if (matches.length === 3) {
      let encodedStr = matches[1]
      let code = matches[2]

      let decodedStr = secret(encodedStr, code, true)

let con = `
${f(decodedStr)}</div><a href="${findNextUrl(result,urls)}">下一页</a>`

$done(con)
      console.log("这是正文：" + f(decodedStr), "这是下一页：" + findNextUrl(result, "https://www.1yydstxt178.com/36/36777/798053_2.html"));
    
    }
    
  }

  beginStr = '<div id="chapter">';
  beginIndex = result.indexOf(beginStr);
  if (beginIndex > 0) { // 乱序，图片替换
    let beginNsStr = "var ns='";
    let beginNsIndex = result.indexOf(beginNsStr);
    let subNsStr = result.substr(beginNsIndex + beginNsStr.length);
    let endNsIndex = subNsStr.indexOf("';");

    let nsStr = atob(subNsStr.substr(0, endNsIndex));   //be64

    let matches = result.match(/<div class="(\w{8})" id="\1">(.*?)<\/div>/s)
    if (matches.length === 3) {
      let tarStr = matches[2];
      tarStr = tarStr.replaceAll(/<img src="\/toimg\/data\/([a-z0-9]+\.png)"\s*\/>/g, function (a, b) {
        return imgMaps[b];
      });

      let lineArr = tarStr.split('<br><br>');
      let nsArr = nsStr.split(',');

      let startLine = nsArr[0];

      let res = '';
      for (let i = 1; i < nsArr.length; i++) {
        res += lineArr[nsArr[i] - startLine] + '\n';
      }
let con = `
${f(res)}</div><a href="${findNextUrl(result,urls)}">下一页</a>`

$done(con)

      return {
        'content': f(res),
        'removeHtmlKeys': 'content',
        autoRequestMore: true,
        nextUrl: findNextUrl(result, params.responseUrl),
        nextParams: {},
      };
    }
  }



  if (result.search(/{'j':'1'}/) !== -1) { // 顺序，图片替换，内容截断
    beginStr = '<div class="neirong">';
    beginIndex = result.indexOf(beginStr);
    if (beginIndex > 0) {
      let subStr = result.substr(beginIndex + beginStr.length);
      let endIndex = subStr.indexOf('</div>');
      let tarStr = subStr.substr(0, endIndex);

      tarStr = tarStr.replaceAll(/<img src="\/toimg\/data\/([a-z0-9]+\.png)"\s*\/>/g, function (a, b) {
        return imgMaps[b];
      });


const myRequest = {
     url: urls,
method:"post",
  body:"j=1",
     headers:{"user-agent":ua,"Cookie":ck}
};


let con = `
${f(tarStr)}</div>`
let p = `<a href="${findNextUrl(result,urls)}">下一页</a>`
$task.fetch(myRequest).then(res => {


let str = res.body
/*
for (let key in imgMaps) {
            let reg = new RegExp(`<img src="/toimg/data/${key}"/>`, "g")
            str = str.replace(reg, imgMaps[key])
        }   图片替换
*/
str = str.replaceAll(/<img src="\/toimg\/data\/([a-z0-9]+\.png)"\s*\/>/g, function (a, b) {
        return imgMaps[b];
      });

let conn = con + f(str) + "<br/>" + p
$done(conn)
   
}, reason => {
    console.log(reason.error);
    $done();
});


    }
  }else{




  beginStr = '<div class="neirong">';
  beginIndex = result.indexOf(beginStr);
  if (beginIndex > 0) {
    let subStr = result.substr(beginIndex + beginStr.length);
    let endIndex = subStr.indexOf('</div>');
    let tarStr = subStr.substr(0, endIndex);

    tarStr = tarStr.replaceAll(/<img src="\/toimg\/data\/([a-z0-9]+\.png)"\s*\/>/g, function (a, b) {
      return imgMaps[b];
    });
let con = `
${f(tarStr).replace(/<i>|<\/i>/g,"")}</div><a href="${findNextUrl(result,urls)}">下一页</a>`
//好多i
$done(con)

    return {
      'content': f(tarStr),
      'removeHtmlKeys': 'content',
      autoRequestMore: true,
      nextUrl: findNextUrl(result, params.responseUrl),
      nextParams: {},
    };
  }

  let tarStr = result.replaceAll(/<img src="\/toimg\/data\/([a-z0-9]+\.png)"\s*\/>/g, function (a, b) {
    return imgMaps[b];
  });
let con = `
${f(tarStr)}</div><a href="${findNextUrl(result,urls)}">下一页</a>`

$done(con)


  return {
    'content': f(tarStr),
    'removeHtmlKeys': 'content',
    autoRequestMore: true,
    nextUrl: findNextUrl(result, params.responseUrl),
    nextParams: {},
  };
  
  }