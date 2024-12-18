import xml.etree.ElementTree as ET

def leerAltimetria(archivoXML):
    """
    Lee el archivo XML pasado como parámetro y devuelve una lista con distancias acumuladas y otra con altitudes.
    """

    try:
        arbol = ET.parse(archivoXML)
    except IOError:
        print('No se encuentra el archivo ', archivoXML)
        exit()
    except ET.ParseError:
        print("Error procesando el archivo XML =", archivoXML)
        exit()

    raiz = arbol.getroot()
    namespace = {'ns': "http://www.uniovi.es"}

    distancias = []
    altitudes = []

    distancia_acumulada = 0

    distancia = 0
    altitud = float(raiz.find('ns:salida/ns:coordenada/ns:altitud', namespace).text)
    distancia_acumulada += distancia
    distancias.append(distancia_acumulada)
    altitudes.append(altitud)


    # Recorrer los tramos y extraer la distancia y altitud de cada uno
    for tramo in raiz.findall('ns:tramos/ns:tramo', namespace):
        distancia = float(tramo.find('ns:distancia', namespace).text)
        altitud = float(tramo.find('ns:coordenada/ns:altitud', namespace).text)

        distancia_acumulada += distancia
        distancias.append(distancia_acumulada)
        altitudes.append(altitud)

    return distancias, altitudes

def crearSVG(distancias, altitudes, archivoSVG):
    """
    Genera un archivo SVG con una polilínea que representa la altimetría del circuito.
    """

    # Tamaño del SVG
    ancho_svg = 800
    alto_svg = 400

    margen_x = 50
    margen_y = 50

    # Calcular la escala
    max_distancia = max(distancias)
    max_altitud = max(altitudes)
    min_altitud = min(altitudes)

    # Escalas para el ajuste en el SVG
    escala_x = (ancho_svg - 2 * margen_x) / max_distancia
    escala_y = (alto_svg - 2 * margen_y) / (max_altitud - min_altitud)

    # Calcular los puntos escalados para la polilínea
    puntos = [
        (
            margen_x + distancia * escala_x,
            alto_svg - margen_y - (altitud - min_altitud) * escala_y
        )
        for distancia, altitud in zip(distancias, altitudes)
    ]

    # Crear archivo SVG
    with open(archivoSVG, 'w') as archivo:
        archivo.write('<?xml version="1.0" encoding="utf-8" standalone="no"?>\n')
        archivo.write('<svg xmlns="http://www.w3.org/2000/svg" ')
        archivo.write(f'width="{ancho_svg}" height="{alto_svg}" version="1.1">\n')

        # Crear la polilínea
        archivo.write('<polyline points="')
        for x, y in puntos:
            archivo.write(f'{x},{y}\n ')
        archivo.write(f'{puntos[-1][0]},{alto_svg - margen_y} {puntos[0][0]},{alto_svg - margen_y}')
        archivo.write(f'" style="fill:none;stroke:red;stroke-width:2" />\n')

        # Etiquetas de ejes
        archivo.write('<line x1="{0}" y1="{1}" x2="{0}" y2="{2}" style="stroke:black;stroke-width:1"/>\n'.format(
            margen_x, margen_y, alto_svg - margen_y))
        archivo.write('<line x1="{0}" y1="{1}" x2="{2}" y2="{1}" style="stroke:black;stroke-width:1"/>\n'.format(
            margen_x, alto_svg - margen_y, ancho_svg - margen_x))

        archivo.write('</svg>')

    print(f"Archivo SVG generado: {archivoSVG}")

def main():
    nombreArchivoXML = "circuitoEsquema.xml"
    nombreSalidaSVG = "altimetria.svg"

    # Conseguir distancias y altitudes del XML
    distancias, altitudes = leerAltimetria(nombreArchivoXML)

    # Crear archivo SVG
    crearSVG(distancias, altitudes, nombreSalidaSVG)

if __name__ == "__main__":
    main()
