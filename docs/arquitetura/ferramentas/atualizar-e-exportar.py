"""Atualiza o sumário e os campos do DOCX com o LibreOffice (UNO) e exporta o PDF.

Uso (na pasta docs/arquitetura/ferramentas):
    python3 atualizar-e-exportar.py ../DA_DocumentoArquiteturaSoftware_v3.2.docx
"""
import os
import subprocess
import sys
import time

import uno
from com.sun.star.beans import PropertyValue


def prop(nome, valor):
    p = PropertyValue()
    p.Name = nome
    p.Value = valor
    return p


def main(caminho):
    caminho = os.path.abspath(caminho)
    url = uno.systemPathToFileUrl(caminho)
    perfil = '/tmp/lo-doaaqui-perfil'
    proc = subprocess.Popen([
        'soffice', '--headless', '--invisible', '--nologo', '--norestore',
        f'-env:UserInstallation=file://{perfil}',
        '--accept=socket,host=127.0.0.1,port=2099;urp;',
    ])
    try:
        local = uno.getComponentContext()
        resolver = local.ServiceManager.createInstanceWithContext('com.sun.star.bridge.UnoUrlResolver', local)
        ctx = None
        for _ in range(60):
            try:
                ctx = resolver.resolve('uno:socket,host=127.0.0.1,port=2099;urp;StarOffice.ComponentContext')
                break
            except Exception:
                time.sleep(0.5)
        if ctx is None:
            raise RuntimeError('LibreOffice não respondeu')
        desktop = ctx.ServiceManager.createInstanceWithContext('com.sun.star.frame.Desktop', ctx)
        doc = desktop.loadComponentFromURL(url, '_blank', 0, (prop('Hidden', True),))

        # Troca o marcador [[SUMARIO]] por um sumário nativo, montado a partir dos títulos (níveis 1 e 2).
        busca = doc.createSearchDescriptor()
        busca.SearchString = '[[SUMARIO]]'
        achado = doc.findFirst(busca)
        if achado is not None and doc.getDocumentIndexes().getCount() == 0:
            achado.setString('')
            indice = doc.createInstance('com.sun.star.text.ContentIndex')
            indice.CreateFromOutline = True
            indice.Level = 2
            indice.Title = 'Sumário'
            doc.getText().insertTextContent(achado, indice, False)

        # Duas passadas: a primeira define a paginação, a segunda acerta os números do sumário.
        for _ in range(2):
            indices = doc.getDocumentIndexes()
            for i in range(indices.getCount()):
                indices.getByIndex(i).update()
            doc.getTextFields().refresh()
            doc.refresh()

        doc.storeToURL(url, (prop('FilterName', 'MS Word 2007 XML'),))
        pdf = uno.systemPathToFileUrl(os.path.splitext(caminho)[0] + '.pdf')
        doc.storeToURL(pdf, (prop('FilterName', 'writer_pdf_Export'),))
        doc.close(True)
        print('Sumário atualizado e PDF exportado:', os.path.splitext(caminho)[0] + '.pdf')
    finally:
        try:
            desktop.terminate()
        except Exception:
            pass
        time.sleep(1)
        proc.terminate()


if __name__ == '__main__':
    main(sys.argv[1])
