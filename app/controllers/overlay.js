/**
 *Función que cancela el escanear un codigo.
 */
function cancelar(){
	var Barcode = require('ti.barcode');//se carga el modulo
	/**
	 * @return no regresa nada
	 * hace un exit de la ventana overlay
	 */
	Barcode.cancel();
}
