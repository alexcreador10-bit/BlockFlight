/**
 * Une todas las imágenes de una carpeta de Google Drive en un único
 * Google Doc (una imagen por página) y exporta ese documento a PDF,
 * dejando ambos archivos dentro de la misma carpeta.
 *
 * Uso:
 *   1. https://script.google.com  ->  Nuevo proyecto
 *   2. Pega este archivo completo.
 *   3. Ajusta FOLDER_ID si hace falta.
 *   4. Ejecuta unirImagenes() y acepta los permisos.
 *   5. Si el script se corta por tiempo (límite de 6 min), vuelve a
 *      ejecutar unirImagenes(): retoma donde se quedó.
 *
 * Para empezar de cero: ejecuta reiniciar().
 */

var FOLDER_ID = '1dbKKekVTsYlDrDmHq4yafkTRIJ3KCReP';

// Nombres de salida.
var DOC_NAME = 'Imagenes unidas';
var PDF_NAME = 'Imagenes unidas.pdf';

// Márgenes del documento en puntos (72 pt = 1 pulgada).
var MARGIN = 36;

// Cuántas imágenes procesar por ejecución antes de guardar y parar.
// Bájalo si sigues topando con el límite de tiempo.
var BATCH_SIZE = 40;

// Área útil de una página Letter (612 x 792 pt) con los márgenes de arriba.
var MAX_W = 612 - MARGIN * 2;
var MAX_H = 792 - MARGIN * 2;

var PROP_DOC_ID = 'mergeDocId';
var PROP_DONE = 'mergeDoneCount';

function unirImagenes() {
  var props = PropertiesService.getScriptProperties();
  var folder = DriveApp.getFolderById(FOLDER_ID);

  var files = listarImagenes(folder);
  if (!files.length) {
    throw new Error('No se encontró ninguna imagen en la carpeta.');
  }

  var doc = obtenerDoc_(props, folder);
  var body = doc.getBody();
  var done = Number(props.getProperty(PROP_DONE) || 0);

  if (done >= files.length) {
    Logger.log('Todas las imágenes ya estaban insertadas. Exportando PDF...');
    return exportarPdf_(doc, folder);
  }

  var limite = Math.min(done + BATCH_SIZE, files.length);
  var saltadas = [];

  for (var i = done; i < limite; i++) {
    var file = files[i];
    try {
      if (i > 0) {
        body.appendPageBreak();
      }
      var img = body.appendImage(file.getBlob());
      escalar_(img);
    } catch (err) {
      saltadas.push(file.getName() + ' (' + err.message + ')');
    }
    props.setProperty(PROP_DONE, String(i + 1));
  }

  // Fuerza el guardado antes de que termine la ejecución.
  doc.saveAndClose();

  if (saltadas.length) {
    Logger.log('Imágenes saltadas:\n' + saltadas.join('\n'));
  }

  if (limite < files.length) {
    Logger.log(
      'Procesadas ' + limite + ' de ' + files.length + '. ' +
      'Vuelve a ejecutar unirImagenes() para continuar.');
    return null;
  }

  Logger.log('Insertadas las ' + files.length + ' imágenes. Exportando PDF...');
  return exportarPdf_(DocumentApp.openById(doc.getId()), folder);
}

/** Borra el estado guardado para poder empezar de cero. */
function reiniciar() {
  PropertiesService.getScriptProperties().deleteAllProperties();
  Logger.log('Estado reiniciado. El Doc anterior, si existe, no se borra.');
}

/**
 * Devuelve las imágenes de la carpeta ordenadas por nombre, tratando los
 * números como números (foto2.jpg antes que foto10.jpg).
 */
function listarImagenes(folder) {
  var files = [];
  var it = folder.getFiles();
  while (it.hasNext()) {
    var f = it.next();
    if (f.getMimeType().indexOf('image/') === 0) {
      files.push(f);
    }
  }
  files.sort(function (a, b) {
    return compararNatural_(a.getName(), b.getName());
  });
  return files;
}

function compararNatural_(a, b) {
  var re = /(\d+)|(\D+)/g;
  var ta = a.toLowerCase().match(re) || [];
  var tb = b.toLowerCase().match(re) || [];
  for (var i = 0; i < Math.min(ta.length, tb.length); i++) {
    var na = parseInt(ta[i], 10);
    var nb = parseInt(tb[i], 10);
    if (!isNaN(na) && !isNaN(nb)) {
      if (na !== nb) return na - nb;
    } else if (ta[i] !== tb[i]) {
      return ta[i] < tb[i] ? -1 : 1;
    }
  }
  return ta.length - tb.length;
}

function obtenerDoc_(props, folder) {
  var id = props.getProperty(PROP_DOC_ID);
  if (id) {
    try {
      return DocumentApp.openById(id);
    } catch (err) {
      // El Doc se borró: creamos uno nuevo desde cero.
      props.deleteProperty(PROP_DOC_ID);
      props.deleteProperty(PROP_DONE);
    }
  }

  var doc = DocumentApp.create(DOC_NAME);
  var body = doc.getBody();
  body.setMarginTop(MARGIN);
  body.setMarginBottom(MARGIN);
  body.setMarginLeft(MARGIN);
  body.setMarginRight(MARGIN);

  // DocumentApp.create() deja el archivo en la raíz de Mi unidad.
  var file = DriveApp.getFileById(doc.getId());
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  props.setProperty(PROP_DOC_ID, doc.getId());
  props.setProperty(PROP_DONE, '0');
  return doc;
}

/** Ajusta la imagen al área útil de la página sin deformarla. */
function escalar_(img) {
  var w = img.getWidth();
  var h = img.getHeight();
  if (!w || !h) return;
  var factor = Math.min(MAX_W / w, MAX_H / h, 1);
  img.setWidth(Math.round(w * factor));
  img.setHeight(Math.round(h * factor));
}

function exportarPdf_(doc, folder) {
  var pdf = DriveApp.getFileById(doc.getId())
    .getAs('application/pdf')
    .setName(PDF_NAME);

  // Sustituye un PDF anterior con el mismo nombre en vez de duplicarlo.
  var existentes = folder.getFilesByName(PDF_NAME);
  while (existentes.hasNext()) {
    existentes.next().setTrashed(true);
  }

  var file = folder.createFile(pdf);
  Logger.log('PDF creado: ' + file.getUrl());
  return file.getUrl();
}
