/////////////////////////////////////VARIABLES/////////////////////////
/**
 Los códigos QR escaneados seran almacenados en la variable scannedBarcodes(objeto JSON)
 ejemplo de console.log(JSON.stringify(scannedBarcodes)); -> resultado: {"http://goo.gl/70hW4":true} 
 */
var scannedBarcodes = {};

/**   CONFIGURACION DEL MODULO
 El modulo ti.barcode tiene las siguientes propiedades: 
 allowRotation: si es true permite escanear un còdigo QR en las dos orientaciones: portrait y landscape
 displayedMessage: el mensaje que se muestra al momento de abrir la camara, abajo del boton de cancelar.
 useFrontCamera: Controla si se usara la camara delantera para escanear. Si no hay camara delantera se usara la que este disponible, true: para camara trasera(selfie), false: para camara delantera
 useLED: activa el flash de la camara
 */
var Barcode = require('ti.barcode');//se carga el modulo
/////////////////////////////////CONFIGURACION/////////////////////////////
Barcode.allowRotation = true;
Barcode.displayedMessage = 'Coloca el código QR dentro del visor rectangular para escanearlo';
Barcode.useFrontCamera= false; //default
Barcode.useLED = false; //defautl

//////////////////////////////////// EVENTOS///////////////////////////
/**  
 * Ti.Barcode.addEventListener() usa para procesar los siguientes eventos son enviados de el modulo:success,error,cancel.
 */

/**Si el escaneo es exitoso: muestra tres resultados(Resultado,tipo de contenido y Formato)
El objeto del evento (e) contiene los siguientes métodos y propiedades:
format[string, Android only] : El formato del código-> QR_CODE(en este caso)
result[string] : El contenido del código.
contentType[int] :El tipo de contenido del código.Para determinar cual es el tipo de contenido se usan las siguientes constantes(int) definidas por el modulo(ti.barcode):
    Barcode.URL=>1
	Barcode.SMS=>2
	Barcode.TELEPHONE=>3
	Barcode.TEXT=>4
	Barcode.CALENDAR=>5
	Barcode.GEOLOCATION=>6
	Barcode.EMAIL=>7
	Barcode.CONTACT=>8
	Barcode.BOOKMARK=>9
	Barcode.WIFI=>10
*Nota: cada vez que la cámara escanea un código QR emite un sonido(bip)[Android only]
*/
Barcode.addEventListener('success', function (e) {
	/** Si no esta ya almacenado ese código QR entonces lo guarda en la variable scannedBarcodes*/
    if (!scannedBarcodes['' + e.result]) {
        scannedBarcodes[e.result] = true;
        $.scanResult.text += e.result + ' ';
        $.scanContentType.text += parseContentType(e.contentType) + ' ';
        $.scanFormat.text += e.format + ' ';
    }
});
/** Si el escaneo manda error
 Sent when an error occurs. The event object contains the following fields:
 message[string] : The error message
 */
Barcode.addEventListener('error', function (e) {
    $.scanContentType.text = ' ';
    $.scanFormat.text = ' ';
    $.scanResult.text = e.message;
});
/** Si el escaneo manda cancelado*/
Barcode.addEventListener('cancel', function (e) {
    Ti.API.info('Cancelado');
});

////////////////////////////////FUNCIONES ////////////////////////////////////

/**
 * Función para solicitar permisos de camara y acceder a galleria.
 */
function configurarQR(e) {
	/** Si el sistema operativo es ANDROID*/
	if(OS_ANDROID){
		var hasCameraPermissions = Ti.Media.hasCameraPermissions();
		/** Checa si ya tengo los permisos de camara*/
		if(!hasCameraPermissions){
			Ti.Media.requestCameraPermissions(function(e){
				if(e.success === true){
					$.winQR.open();
				}else {
					alert("Acceso denegado, error: " + e.error);
					configurarQR();
				}
			});
		}else {
			$.winQR.open();
		}
	}
	/** Si el sistema operativo es IOS*/
	if(OS_IOS){
		var hasCameraPermissions = Ti.Media.hasCameraPermissions();
		/** Checa si ya tengo los permisos de camara*/
		if(!hasCameraPermissions){
			Ti.Media.requestCameraPermissions(function(e){
				if(e.success === true){
					$.winQR.open();
				}else {
					alert("Acceso denegado, error: " + e.error);
					configurarQR();
				}
			});
		}else {
			$.winQR.open();
		}
	}
}

/**Se invoca la funcion para configurar permisos y abrir vista principal(index.xml)*/
configurarQR();

/**
 * Función que se encarga de escanear un código QR
 */
function escanearQR(){
	reset();	
	var overlayVista = Alloy.createController('overlay').getView();	//la vista donde se escanea el código QR usando la camara
    /**
     * Barcode.capture: Activa la cámara y comienza la captura para procesar un código QR: tiene las siguientes propiedades:
     * animate: indica si se debe continuar en el caso de que la actividad actual y la actividad de la camara esten en distinta orientacion
     * overlay: es una view donde se muestra la actividad de la camara.
     * showCancel: si incluir o no el botón de "cancelar" en la vista overlay.
     * showRectangle: para incluir o no un rectangulo alrededor del area de escaner.
     * KeepOpen: true para mantener abierto el escaner despues de que se haya escaneado un codigo QR.
     * acceptedFormats: Una matriz opcional de constantes int que detalla qué formatos de código se aceptan:
     * Barcode Format Constants:
		FORMAT_NONE[int]
		FORMAT_QR_CODE[int]
		FORMAT_DATA_MATRIX[int]
		FORMAT_UPC_E[int]
		FORMAT_UPC_A[int]
		FORMAT_EAN_8[int]
		FORMAT_EAN_13[int]
		FORMAT_CODE_128[int]
		FORMAT_CODE_39[int]
		FORMAT_ITF[int] 
	*Nota:cada vez que la cámara escanea un código QR emite un sonido(bip), solo Android.
    */
    Barcode.capture({
        animate: true,
        overlay: overlayVista,
        showCancel: true,
        showRectangle: true,
        keepOpen: false,
        acceptedFormats: [
            Barcode.FORMAT_QR_CODE
        ]
    });
}

/**
 * Función que escanea una imagen de la galeria del celular.
 * Nota: al escanear de la galeria no se emite sonido(bip).
 */
function escanearGalleria(){
	reset();
    Ti.Media.openPhotoGallery({
        success: function (e) {
        	/**
        	 *Barcode.parse: analiza una imagen(codigo QR). Tiene las sig propiedades:
        	 *image: La imagen que sera escaneada.
        	 *acceptedFormats: Una matriz de constantes(int), que detalla qué formatos de código se aceptan
        	 */
            Barcode.parse({
                image: e.media,
                acceptedFormats: [
                    Barcode.FORMAT_QR_CODE //formato: código QR
                ]
            });
        }
    });
}

/**
 * Método que limpia las variables y las deja vacias.
 * Es invocado al escanear de la cámara y al escanear de galería del dispositivo.
 */
function reset() {
    scannedBarcodes = {};
    $.scanResult.text = ' ';
    $.scanContentType.text = ' ';
    $.scanFormat.text = ' ';
}

/** Regresa el tipo de información que contiene el codigo QR (String)
* @param contentType= es el tipo de contenido del QR(e.contentType)
*/
function parseContentType(contentType) {
    switch (contentType) {
        case Barcode.URL:
            return 'URL';
        case Barcode.SMS:
            return 'SMS';
        case Barcode.TELEPHONE:
            return 'TELEFONO';
        case Barcode.TEXT:
            return 'TEXTO';
        case Barcode.CALENDAR:
            return 'CALENDARIO';
        case Barcode.GEOLOCATION:
            return 'GEOLOCALIZACION';
        case Barcode.EMAIL:
            return 'EMAIL';
        case Barcode.CONTACT:
            return 'CONTACTO';
        case Barcode.BOOKMARK:
            return 'MARCADOR';
        case Barcode.WIFI:
            return 'WIFI';
        default:
            return 'DESCONOCIDO';
    }
}
