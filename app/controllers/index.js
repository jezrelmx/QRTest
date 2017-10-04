function doClick(e) {
	/** Si es un sistema operativo Android */
	if(OS_ANDROID) {
		
		var hasCameraPermissions = Ti.Media.hasCameraPermissions();
		/** Checa si ya tengo los permisos de camara*/
		if(!hasCameraPermissions){
			Ti.Media.requestCameraPermissions(function(e) {
				if (e.success === true) {
					escanearQR();
	        	} else {
					alert("Acceso denegado, error: " + e.error);
	        	}
			});
		}
		else {
			escanearQR();
		}
		
		/**metodo que configura el escaneo de codigo QR 
		 */	
		function escanearQR() {
			/**
			 * In this example, we'll use the Barcode module to display some information about
			 * the scanned barcode.
			 *tiene las siguientes propiedades: 
			 *allowRotation: si es true permite escanear un còdigo QR en las dos orientaciones: portrait y landscape
			 *displayedMessage: el mensaje que se muestra al momento de escanear (overlay)
			 *allowMenu: true para mostrar el menu de ZXing (solo para Android)
			 *allowInstructions: muestra instrucciones de ayuda y cambios cuando la app es actualizada (solo Android)
			 *useLED: activa el flash de la camara
			 */
			var Barcode = require('ti.barcode');//este es el nombre del modulo
			Barcode.allowRotation = true;
			Barcode.displayedMessage = '';
			Barcode.allowMenu = true;
			Barcode.allowInstructions = false;
			Barcode.useLED = false; 
			/** Ventana principal*/
			var window = Ti.UI.createWindow({
			    backgroundColor: 'white'
			});
			/** un scrollView en la ventana principal*/
			var scrollView = Ti.UI.createScrollView({
			    contentWidth: 'auto',
			    contentHeight: 'auto',
			    top: 0,
			    showVerticalScrollIndicator: true,
			    layout: 'vertical'
			});
			
			/**
			 * Create a chrome for the barcode scanner.
			 * overlay es una view donde se muestra lo que esta viendo la camara.
			 * es un parametro obligatorio en la creacion del scanner(Barcode.capture)
			 */
			var overlay = Ti.UI.createView({
			    backgroundColor: 'transparent',
			    top: 0, right: 0, bottom: 0, left: 0
			});
			/** boton para cambiar de camara ya sea trasera o delantera
			 *Barcode.useFrontCamera: regresa false si esta usando la camara delantera
			 *regresa true si se esta usando la camara trasera(selfie)
			 *si el dispositivo no cuenta con camara trasera usara la camara que este disponible
			 *propìedad style es solo para IOS. Es para el estilo del boton (color,borde, background)
			 */
			var switchButton = Ti.UI.createButton({
			    title: Barcode.useFrontCamera ? 'Camera Delantera' : 'Camara Trasera',
			    textAlign: 'center',
			    color: '#000', backgroundColor: '#fff', style: 0,
			    font: { fontWeight: 'bold', fontSize: 16 },
			    borderColor: '#000', borderRadius: 10, borderWidth: 1,
			    opacity: 0.5,
			    width: 220, height: 30,
			    bottom: 10
			});
			switchButton.addEventListener('click', function () {
			    Barcode.useFrontCamera = !Barcode.useFrontCamera;
			    switchButton.title = Barcode.useFrontCamera ? 'Camera Delantera' : 'Camara Trasera';
			});
			overlay.add(switchButton);
			var cancelButton = Ti.UI.createButton({
			    title: 'Cancelar', textAlign: 'center',
			    color: '#000', backgroundColor: '#fff', style: 0,
			    font: { fontWeight: 'bold', fontSize: 16 },
			    borderColor: '#000', borderRadius: 10, borderWidth: 1,
			    opacity: 0.5,
			    width: 220, height: 30,
			    top: 10
			});
			cancelButton.addEventListener('click', function () {
			    Barcode.cancel();
			});
			overlay.add(cancelButton);
			
			/**
			 * Create a button that will trigger the barcode scanner.
			 */
			var scanCode = Ti.UI.createButton({
			    title: 'Scanear código',
			    width: 150,
			    height: 60,
			    top: 20
			});
			scanCode.addEventListener('click', function () {
			    reset();
			    // Note: while the simulator will NOT show a camera stream in the simulator, you may still call "Barcode.capture"
			    // to test your barcode scanning overlay.
			    /**
			     * Barcode.capture: Activa la cámara y comienza la captura para procesar un código de barras: tienes las siguientes propiedades:
			     * animate: ************indica si se debe continuar en el caso de que la actividad actual y la actividad de la camara esten en distinta orientacion
			     * overlay es una view donde se muestra la actividad de la camara.
			     * showCancel: si incluir o no el boton de "cancelar"
			     * showRectangle: para incluir o no un rectangulo alrededor del area de escaner
			     * KeepOpen: true para mantener abierto el escaner despues de que se haya escaneado un codigo QR
			     * acceptedFormats: Una matriz opcional de constantes int que detalla qué formatos de código se aceptan.De forma predeterminada a todos los formatos.
			     * <<<<<<<Barcode Format Constants:
					FORMAT_NONE[int]
					FORMAT_QR_CODE[int]
					FORMAT_DATA_MATRIX[int]
					FORMAT_UPC_E[int]
					FORMAT_UPC_A[int]
					FORMAT_EAN_8[int]
					FORMAT_EAN_13[int]
					FORMAT_CODE_128[int]
					FORMAT_CODE_39[int]
					FORMAT_ITF[int] >>>>>>>
			     */
			    Barcode.capture({
			        animate: true,
			        overlay: overlay,
			        showCancel: false,
			        showRectangle: false,
			        keepOpen: true/*,
			        acceptedFormats: [
			            Barcode.FORMAT_QR_CODE
			        ]*/
			    });
			});
			scrollView.add(scanCode);
			
			/**
			 * Create a button that will show the gallery picker.
			 */
			var scanImage = Ti.UI.createButton({
			    title: 'Scanear imagen de la galeria',
			    width: 150, height: 60, top: 20
			});
			scanImage.addEventListener('click', function () {
			    reset();
			    Ti.Media.openPhotoGallery({
			        success: function (evt) {
			        	/**
			        	 *Barcode.parse: analiza un imagen para codigo QR. Tiene las sig propiedades:
			        	 *image: The image blob to parse for a barcode.
			        	 *acceptedFormats: Una matriz opcional de constantes int que detalla qué formatos de código se aceptan
			        	 */
			            Barcode.parse({
			                image: evt.media/*,
			                acceptedFormats: [
			                    Barcode.FORMAT_QR_CODE
			                ]*/
			            });
			        }
			    });
			});
			scrollView.add(scanImage);
			/**
			 * Now listen for various events from the Barcode module. This is the module's way of communicating with us.
			 * Se pueden escanear varios codigos QR y estos seran almacenados en la variable scannedBarcodes(objeto)
			 * tambien hay un contador(scannedBarcodesCount) que enumera los QR escaneados
			 */
			var scannedBarcodes = {}, scannedBarcodesCount = 0;
			/**
			 * Metodo que inicializa las variables a cero
			 * es invocado tanto en escanear de camara como el escaneo de galeria
			 */
			function reset() {
			    scannedBarcodes = {};
			    scannedBarcodesCount = 0;
			    cancelButton.title = 'Cancelar';
			
			    scanResult.text = ' ';
			    scanContentType.text = ' ';
			    scanFormat.text = ' ';
			    scanParsed.text = ' ';
			}
			/** Si el escaneo manda error*/
			Barcode.addEventListener('error', function (e) {
			    scanContentType.text = ' ';
			    scanFormat.text = ' ';
			    scanParsed.text = ' ';
			    scanResult.text = e.message;
			});
			/** Si el escaneo manda cancelado*/
			Barcode.addEventListener('cancel', function (e) {
			    Ti.API.info('Cancelado');
			});
			/** Si el escaneo manda exito
			*the event object contains the following fields:
			*format[string, Android only] : The format of the barcode
    		*result[string] : The raw contents of the barcode
    		*code[string, Android only] : The activity result code from the scanning activity. Use the result constants defined in the Ti.Android namespace
    		*contentType[int] : The type of barcode content. Use the constants defined in this module to determine which.
    		*data[object]: The parsed fields associated with the contentType.
			*/
			Barcode.addEventListener('success', function (e) {
			    Ti.API.info('Exito al escanear: ' + e.result);
			    /** Si no esta ya almacenado ese QR entonces lo guarda*/
			    if (!scannedBarcodes['' + e.result]) {
			        scannedBarcodes[e.result] = true;
			        scannedBarcodesCount += 1;
			        cancelButton.title = 'Terminado (' + scannedBarcodesCount + ' Escaneado)';
			
			        scanResult.text += e.result + ' ';
			        scanContentType.text += parseContentType(e.contentType) + ' ';
			        scanFormat.text += e.format + ' ';
			        scanParsed.text += parseResult(e) + ' ';
			    }
			});
			
			/**
			 * Finally, we'll add a couple labels to the window. When the user scans a barcode, we'll stick information about it in
			 * to these labels.
			 */
			scrollView.add(Ti.UI.createLabel({
			    text: 'Talvez necesites rotar tu dispositivo',
			    top: 10,
			    height: Ti.UI.SIZE || 'auto', width: Ti.UI.SIZE || 'auto'
			}));
			
			scrollView.add(Ti.UI.createLabel({
			    text: 'Resultado: ', textAlign: 'left',
			    top: 10, left: 10,
			    color: 'black',
			    height: Ti.UI.SIZE || 'auto'
			}));
			var scanResult = Ti.UI.createLabel({
			    text: ' ', textAlign: 'left',
			    top: 10, left: 10,
			    color: 'black',
			    height: Ti.UI.SIZE || 'auto'
			});
			scrollView.add(scanResult);
			
			scrollView.add(Ti.UI.createLabel({
			    text: 'Tipo de contenido: ',
			    top: 10, left: 10,
			    textAlign: 'left',
			    color: 'black',
			    height: Ti.UI.SIZE || 'auto'
			}));
			var scanContentType = Ti.UI.createLabel({
			    text: ' ', textAlign: 'left',
			    top: 10, left: 10,
			    color: 'black',
			    height: Ti.UI.SIZE || 'auto'
			});
			scrollView.add(scanContentType);
			
			scrollView.add(Ti.UI.createLabel({
			    text: 'Formato: ', textAlign: 'left',
			    top: 10, left: 10,
			    color: 'black',
			    height: Ti.UI.SIZE || 'auto'
			}));
			var scanFormat = Ti.UI.createLabel({
			    text: ' ', textAlign: 'left',
			    top: 10, left: 10,
			    color: 'black',
			    height: Ti.UI.SIZE || 'auto'
			});
			scrollView.add(scanFormat);
			
			scrollView.add(Ti.UI.createLabel({
			    text: 'Parsed: ', textAlign: 'left',
			    top: 10, left: 10,
			    color: 'black',
			    height: Ti.UI.SIZE || 'auto'
			}));
			var scanParsed = Ti.UI.createLabel({
			    text: ' ', textAlign: 'left',
			    top: 10, left: 10,
			    color: 'black',
			    height: Ti.UI.SIZE || 'auto'
			});
			scrollView.add(scanParsed);
			
			/** Regresa el tipo de informacion que contiene el codigo QR
			* @param contentType= es el tipo de contenido (e.contentType)
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

			/**
			 * @param  object event is passed to event handlers
			 * @return msg which is the format of the content type 
			 */
			function parseResult(event) {
			    var msg = '';
			    switch (event.contentType) {
			        case Barcode.URL:
			            msg = 'URL = ' + event.result;
			            break;
			        case Barcode.SMS:
			            msg = 'SMS = ' + JSON.stringify(event.data);
			            break;
			        case Barcode.TELEPHONE:
			            msg = 'Telephone = ' + event.data.phonenumber;
			            break;
			        case Barcode.TEXT:
			            msg = 'Text = ' + event.result;
			            break;
			        case Barcode.CALENDAR:
			            msg = 'Calendar = ' + JSON.stringify(event.data);
			            break;
			        case Barcode.GEOLOCATION:
			            msg = 'Geo = ' + JSON.stringify(event.data);
			            break;
			        case Barcode.EMAIL:
			            msg = 'Email = ' + event.data.email + '\nSubject = ' + event.data.subject + '\nMessage = ' + event.data.message;
			            break;
			        case Barcode.CONTACT:
			            msg = 'Contact = ' + JSON.stringify(event.data);
			            break;
			        case Barcode.BOOKMARK:
			            msg = 'Bookmark = ' + JSON.stringify(event.data);
			            break;
			        case Barcode.WIFI:
			            return 'WIFI = ' + JSON.stringify(event.data);
			        default:
			            msg = 'unknown content type';
			            break;
			    }
			    return msg;
			}

			window.add(scrollView);
			window.open();
		}
	}
	/** Si el sistema operativo es IOS*/
	if(OS_IOS) {

		var hasCameraPermissions = Ti.Media.hasCameraPermissions();
		var hasPhotoGalleryPermissions = Ti.Media.hasPhotoGalleryPermissions();

		Ti.Media.requestPhotoGalleryPermissions(function(e) {
			if (e.success === true) {
				escanearQR();
	        } else {
				alert("Acceso denegado, error: " + e.error);
	        }
		});
		/** Checa si ya tengo los permisos de camara*/
		if(!hasCameraPermissions){
			Ti.Media.requestCameraPermissions(function(e) {
				if (e.success === true) {
					escanearQR();
		        } else {
					alert("Acceso denegado, error: " + e.error);
		        }
			});
		}else {
			escanearQR();
		}
		
		/**metodo que configura el escaneo de codigo QR */	
		function escanearQR() {
			/**
			 * In this example, we'll use the Barcode module to display some information about
			 * the scanned barcode.
			 */
			var Barcode = require('ti.barcode');//este es el nombre del modulo
			Barcode.allowRotation = true;
			Barcode.displayedMessage = 'SmartCDMX ';
			Barcode.useLED = false;
			/** Ventana principal*/
			var window = Ti.UI.createWindow({
			    backgroundColor: 'white'
			});
			var scrollView = Ti.UI.createScrollView({
			    contentWidth: 'auto',
			    contentHeight: 'auto',
			    top: 0,
			    showVerticalScrollIndicator: true,
			    layout: 'vertical'
			});
			
			/**
			 * Create a chrome for the barcode scanner.
			 * overlay es una view para el escaneo con camara 
			 * es un parametro obligatorio en la creacion del scanner(Barcode.capture)
			 */
			var overlay = Ti.UI.createView({
			    backgroundColor: 'transparent',
			    top: 0, right: 0, bottom: 0, left: 0,
			    layout : 'vertical'
			});
			/** boton para cambiar de camara ya sea trasera o delantera*/
			var switchButton = Ti.UI.createButton({
			    title: Barcode.useFrontCamera ? 'Camera Delantera' : 'Camara Trasera',
			    textAlign: 'center',
			    color: '#000', backgroundColor: '#fff', style: 0,
			    font: { fontWeight: 'bold', fontSize: 16 },
			    borderColor: '#000', borderRadius: 10, borderWidth: 1,
			    opacity: 0.5,
			    width: 220, height: 30,
			    bottom: 10
			});
			switchButton.addEventListener('click', function () {
			    Barcode.useFrontCamera = !Barcode.useFrontCamera;
			    switchButton.title = Barcode.useFrontCamera ? 'Camera Delantera' : 'Camara Trasera';
			});
			overlay.add(switchButton);
			/**
			*esta funcion solo esta disponible para el Sistema operativo IOS
			var toggleLEDButton = Ti.UI.createButton({
			    title: Barcode.useLED ? 'LED is On' : 'LED is Off',
			    textAlign: 'center',
			    color: '#000', backgroundColor: '#fff', style: 0,
			    font: { fontWeight: 'bold', fontSize: 16 },
			    borderColor: '#000', borderRadius: 10, borderWidth: 1,
			    opacity: 0.5,
			    width: 220, height: 30,
			    bottom: 40
			});
			toggleLEDButton.addEventListener('click', function () {
			    Barcode.useLED = !Barcode.useLED;
			    toggleLEDButton.title = Barcode.useLED ? 'LED is On' : 'LED is Off';
			});
			overlay.add(toggleLEDButton);
			*/
			var cancelButton = Ti.UI.createButton({
			    title: 'Cancel', textAlign: 'center',
			    color: '#000', backgroundColor: '#fff', style: 0,
			    font: { fontWeight: 'bold', fontSize: 16 },
			    borderColor: '#000', borderRadius: 10, borderWidth: 1,
			    opacity: 0.5,
			    width: 220, height: 30,
			    top: 20
			});
			cancelButton.addEventListener('click', function () {
				console.log('esto imprime el barcode cancel:');
			    console.log(Barcode.cancel());
			});
			overlay.add(cancelButton);
			
			/**
			 * Create a button that will trigger the barcode scanner.
			 */
			var scanCode = Ti.UI.createButton({
			    title: 'Scanear código',
			    width: 200,
			    height: 60,
			    top: 20
			});
			scanCode.addEventListener('click', function () {
			    //reset();  //si se comenta se almacena en 'scannedBarcodes' toda la info de los QR que sean escaneados
			    // Note: while the simulator will NOT show a camera stream in the simulator, you may still call "Barcode.capture"
			    // to test your barcode scanning overlay.
			    Barcode.capture({
			        animate: false,
			        overlay: overlay,
			        showCancel: false,
			        showRectangle: false,
			        keepOpen: true/*,
			        acceptedFormats: [
			            Barcode.FORMAT_QR_CODE
			        ]*/
			    });
			});
			scrollView.add(scanCode);
			
			/**
			 * Create a button that will show the gallery picker.
			 */
			var scanImage = Ti.UI.createButton({
			    title: 'Scanear imagen de la galeria',
			    width: 200, height: 60, top: 20
			});
			scanImage.addEventListener('click', function () {
			    reset();
			    Ti.Media.openPhotoGallery({
			        success: function (evt) {
			            Barcode.parse({
			                image: evt.media/*,
			                acceptedFormats: [
			                    Barcode.FORMAT_QR_CODE
			                ]*/
			            });
			        }
			    });
			});
			scrollView.add(scanImage);
			
			/**
			 * Now listen for various events from the Barcode module. This is the module's way of communicating with us.
			 * Los codigos QR escaneados seran almacenados en la variable scannedBarcodes(objeto json)
			 * tambien hay un contador(scannedBarcodesCount) que enumera los QR escaneados
			 */
			var scannedBarcodes = {}, scannedBarcodesCount = 0;
			/**
			 * Metodo que inicializa las variables a cero
			 * es invocado tanto en escanear de camara como el escaneo de galeria
			 */
			function reset() {
			    scannedBarcodes = {};
			    scannedBarcodesCount = 0;
			    cancelButton.title = 'Cancelar';
			
			    scanResult.text = ' ';
			    scanContentType.text = ' ';
			    scanParsed.text = ' ';
			}
			/** Si el escaneo manda error*/
			Barcode.addEventListener('error', function (e) {
			    scanContentType.text = ' ';
			    scanParsed.text = ' ';
			    scanResult.text = e.message;
			});
			/** Si el escaneo manda cancelado*/
			Barcode.addEventListener('cancel', function (e) {
			    Ti.API.info('Cancelado');
			});
			/** Si el escaneo manda exito*/
			Barcode.addEventListener('success', function (e) {
			    Ti.API.info('Exito al escanear: ' + e.result);
			    /** Si no esta ya almacenado ese QR entonces lo guarda*/
			    //console.log(JSON.stringify(scannedBarcodes)); -> example of a result: {"http://goo.gl/70hW4":true} 
			    if (!scannedBarcodes['' + e.result]) {
			        scannedBarcodes[e.result] = true;
			        scannedBarcodesCount += 1;
			        cancelButton.title = 'Terminado (' + scannedBarcodesCount + ' Escaneado)';
			
			        scanResult.text += e.result + ' ';
			        scanContentType.text += parseContentType(e.contentType) + ' ';
			        scanParsed.text += parseResult(e) + ' ';
			    }
			});
			
			/**
			 * Finally, we'll add a couple labels to the window. When the user scans a barcode, we'll stick information about it in
			 * to these labels.
			 */
			scrollView.add(Ti.UI.createLabel({
			    text: 'Talvez necesites rotar tu dispositivo',
			    top: 10,
			    height: Ti.UI.SIZE || 'auto', width: Ti.UI.SIZE || 'auto'
			}));
			
			scrollView.add(Ti.UI.createLabel({
			    text: 'Resultado: ', textAlign: 'left',
			    top: 10, left: 10,
			    color: 'black',
			    height: Ti.UI.SIZE || 'auto'
			}));
			var scanResult = Ti.UI.createLabel({
			    text: ' ', textAlign: 'left',
			    top: 10, left: 10,
			    color: 'black',
			    height: Ti.UI.SIZE || 'auto'
			});
			scrollView.add(scanResult);
			
			scrollView.add(Ti.UI.createLabel({
			    text: 'Tipo de contenido: ',
			    top: 10, left: 10,
			    textAlign: 'left',
			    color: 'black',
			    height: Ti.UI.SIZE || 'auto'
			}));
			var scanContentType = Ti.UI.createLabel({
			    text: ' ', textAlign: 'left',
			    top: 10, left: 10,
			    color: 'black',
			    height: Ti.UI.SIZE || 'auto'
			});
			scrollView.add(scanContentType);
			
			scrollView.add(Ti.UI.createLabel({
			    text: 'Todos los contenidos escaneados: ', textAlign: 'left',
			    top: 10, left: 10,
			    color: 'black',
			    height: Ti.UI.SIZE || 'auto'
			}));
			var scanParsed = Ti.UI.createLabel({
			    text: ' ', textAlign: 'left',
			    top: 10, left: 10,
			    color: 'black',
			    height: Ti.UI.SIZE || 'auto'
			});
			scrollView.add(scanParsed);
			
			/** Regresa el tipo de informacion que contiene el codigo QR*/
			function parseContentType(contentType) {
			    switch (contentType) {
			        case Barcode.URL:
			            return 'URL';
			        case Barcode.SMS:
			            return 'SMS';
			        case Barcode.TELEPHONE:
			            return 'TELEPHONE';
			        case Barcode.TEXT:
			            return 'TEXT';
			        case Barcode.CALENDAR:
			            return 'CALENDAR';
			        case Barcode.GEOLOCATION:
			            return 'GEOLOCATION';
			        case Barcode.EMAIL:
			            return 'EMAIL';
			        case Barcode.CONTACT:
			            return 'CONTACT';
			        case Barcode.BOOKMARK:
			            return 'BOOKMARK';
			        case Barcode.WIFI:
			            return 'WIFI';
			        default:
			            return 'UNKNOWN';
			    }
			}
			
			/**
			 * @param  object event is passed to event handlers
			 * @return msg which is the format of the content type 
			 */
			function parseResult(event) {
			    var msg = '';
			    switch (event.contentType) {
			        case Barcode.URL:
			            msg = 'URL = ' + event.result;
			            break;
			        case Barcode.SMS:
			            msg = 'SMS = ' + JSON.stringify(event.data);
			            break;
			        case Barcode.TELEPHONE:
			            msg = 'Telephone = ' + event.data.phonenumber;
			            break;
			        case Barcode.TEXT:
			            msg = 'Text = ' + event.result;
			            break;
			        case Barcode.CALENDAR:
			            msg = 'Calendar = ' + JSON.stringify(event.data);
			            break;
			        case Barcode.GEOLOCATION:
			            msg = 'Latitude = ' + event.data.latitude + '\nLongitude = ' + event.data.longitude;
			            break;
			        case Barcode.EMAIL:
			            msg = 'Email = ' + event.data.email + '\nSubject = ' + event.data.subject + '\nMessage = ' + event.data.message;
			            break;
			        case Barcode.CONTACT:
			            msg = 'Contact = ' + JSON.stringify(event.data);
			            break;
			        case Barcode.BOOKMARK:
			            msg = 'Bookmark = ' + JSON.stringify(event.data);
			            break;
			        case Barcode.WIFI:
			            return 'WIFI = ' + JSON.stringify(event.data);
			        default:
			            msg = 'unknown content type';
			            break;
			    }
			    return msg;
			}
			
			window.add(scrollView);
			window.open();			
		}
	}
	
}
$.index.open();
