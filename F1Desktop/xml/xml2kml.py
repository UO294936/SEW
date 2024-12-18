import xml.etree.ElementTree as ET

def leerDatos (archivoXML, archivoSalida):
    
    try:
        
        arbol = ET.parse(archivoXML)
        
    except IOError:
        print ('No se encuentra el archivo ', archivoXML)
        exit()
        
    except ET.ParseError:
        print("Error procesando en el archivo XML = ", archivoXML)
        exit()

    raiz = arbol.getroot()

    namespace = {'ns': "http://www.uniovi.es"}

    nombre = raiz.find('ns:nombre', namespace).text

    # Añadir punto de salida
    archivoSalida.write("<Placemark>\n")
    archivoSalida.write("<name>")
    archivoSalida.write("Punto de Salida")
    archivoSalida.write("</name>\n")
    archivoSalida.write("<Point>\n")
    archivoSalida.write("<coordinates>")
    archivoSalida.write(raiz.find('ns:salida/ns:coordenada/ns:latitud', namespace).text+",")
    archivoSalida.write(raiz.find('ns:salida/ns:coordenada/ns:longitud', namespace).text+",")
    archivoSalida.write(raiz.find('ns:salida/ns:coordenada/ns:altitud', namespace).text)
    archivoSalida.write("</coordinates>\n")
    archivoSalida.write("</Point>\n")
    archivoSalida.write("</Placemark>\n")


    # Recorrido de los elementos del árbol
    numeroDeTramo = 0
    tramos = raiz.findall('ns:tramos/ns:tramo', namespace)
    for tramo in tramos:
        numeroDeTramo = numeroDeTramo + 1
        sector = tramo.find("ns:sector", namespace).text
        distancia = tramo.find("ns:distancia", namespace).text
        coord = tramo.find("ns:coordenada", namespace)
        longitud = coord.find("ns:longitud", namespace).text
        latitud = coord.find("ns:latitud", namespace).text
        altitud = coord.find("ns:altitud", namespace).text
        guardarTramo(numeroDeTramo, sector, distancia, longitud, latitud, altitud, archivoSalida)

    
    # Conectar los puntos con una línea
    archivoSalida.write('<Placemark>\n')
    archivoSalida.write('<name>Ruta Completa</name>\n')
    archivoSalida.write('<LineString>\n')
    archivoSalida.write('<tessellate>1</tessellate>\n')
    archivoSalida.write('<coordinates>\n')
    
    archivoSalida.write(raiz.find('ns:salida/ns:coordenada/ns:latitud', namespace).text+",")
    archivoSalida.write(raiz.find('ns:salida/ns:coordenada/ns:longitud', namespace).text+",")
    archivoSalida.write(raiz.find('ns:salida/ns:coordenada/ns:altitud', namespace).text+"\n")
    
    for tramo in tramos:
        coord = tramo.find("ns:coordenada", namespace)
        longitud = coord.find("ns:longitud", namespace).text
        latitud = coord.find("ns:latitud", namespace).text
        altitud = coord.find("ns:altitud", namespace).text
        archivoSalida.write( f"{latitud},{longitud},{altitud}\n" )
    
    archivoSalida.write(raiz.find('ns:salida/ns:coordenada/ns:latitud', namespace).text+",")
    archivoSalida.write(raiz.find('ns:salida/ns:coordenada/ns:longitud', namespace).text+",")
    archivoSalida.write(raiz.find('ns:salida/ns:coordenada/ns:altitud', namespace).text+"\n")

    archivoSalida.write('</coordinates>\n')
    archivoSalida.write('</LineString>\n')
    archivoSalida.write('<Style>\n')
    archivoSalida.write('<LineStyle>\n')
    archivoSalida.write('<color>ff0000ff</color>\n')
    archivoSalida.write('<width>4</width>\n')
    archivoSalida.write('</LineStyle>\n')
    archivoSalida.write('</Style>\n')
    archivoSalida.write('</Placemark>\n')

        
def guardarTramo( numeroDeTramo, sector, distancia, longitud, latitud, altitud, archivoSalida):
    archivoSalida.write("<Placemark>\n")
    archivoSalida.write("<name>")
    archivoSalida.write(f"Tramo {numeroDeTramo} - Sector {sector}")
    archivoSalida.write("</name>\n")
    archivoSalida.write("<description>")
    archivoSalida.write(f"Distancia: {distancia} m")
    archivoSalida.write("</description>\n")
    archivoSalida.write("<Point>\n")
    archivoSalida.write("<coordinates>")
    archivoSalida.write(latitud+",")
    archivoSalida.write(longitud+",")
    archivoSalida.write(altitud)
    archivoSalida.write("</coordinates>\n")
    archivoSalida.write("</Point>\n")
    archivoSalida.write("</Placemark>\n")


def prologoKML(archivo):
    """ Escribe en el archivo de salida el prólogo del archivo KML"""

    archivo.write('<?xml version="1.0" encoding="utf-8"?>\n')
    archivo.write('<kml xmlns="http://www.opengis.net/kml/2.2">\n')
    archivo.write("<Document>\n")
    archivo.write("<name>Bahrein</name>\n")
    archivo.write("<Style id='lineaRoja'>\n") 
    archivo.write("<LineStyle>\n") 
    archivo.write("<color>ff0000ff</color>\n")
    archivo.write("<width>5</width>\n")
    archivo.write("</LineStyle>\n")
    archivo.write("</Style>\n")

def epilogoKML(archivo):
    """ Escribe en el archivo de salida el epílogo del archivo KML"""
    
    archivo.write('</Document>\n')
    archivo.write('</kml>\n')

def main():
    
    nombreArchivo = "circuitoEsquema.xml"
    nombreSalida = "circuito"

    try:
        salida = open(nombreSalida + ".kml",'w')
    except IOError:
        print ('No se puede crear el archivo ', nombreSalida + ".kml")
        exit()


    # Procesamiento y generación del archivo kml

    prologoKML(salida)
    
    leerDatos(nombreArchivo, salida)

    epilogoKML(salida)

    print("Archivo KML generado : " +nombreSalida+".kml")
    salida.close()

if __name__ == "__main__":
    main()




    
     