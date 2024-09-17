import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import logo1 from '../assets/viact-c.png'
import { rtCertificados } from "../utils/APIRoutes";
import { DataGrid, Popup, Toolbar } from "devextreme-react";
import { Column, Editing, FilterRow, HeaderFilter, Scrolling, Search, Selection, ColumnChooser, ColumnFixing, Button, Paging, Item } from "devextreme-react/data-grid";
import { locale, loadMessages } from 'devextreme/localization';
import esMessages from 'devextreme/localization/messages/es.json';
import Notify from 'devextreme/ui/notify';
locale('es');
loadMessages(esMessages);
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import pako from "pako";

export const objToXML = (obj) => {
  var xml = ''
  for (skey in obj) {
      switch (typeof obj[skey]) {
          case 'object':
              var skey = skey
              xml += `<` + skey + `>\n`
              xml += objToXML(obj[skey])
              xml += `</` + skey + `>\n`
              break;
          default:
              if (obj[skey] == '') {
                  xml += `<` + skey + `/>\n`
              } else {
                  xml += `<` + skey + `>` + obj[skey] + `</` + skey + `>\n`
              }
              break;
      }
  }
  return xml
}

export default function Certificados() {
  const [certificados, setCertificados] = useState([])
  const [popupNuevoVisible, setPopupNuevoVisible] = useState(false);
  
  async function traerCertificados() {
    const { data } = await axios.post(rtCertificados, {
      METODO: 'LISTAR_CERTIFICADOS',
      NRO_DOC: '',
      LIBRO: '',
      FOLIO: '',
      NUMERO: '',
      XMLDOC: '',
    });
    setCertificados(data.data)
    console.log(data.data)
  }

  useEffect(() => {
		traerCertificados()
	}, [])
  
  const showNuevoPopup = useCallback(() => {
    setPopupNuevoVisible(true);
  }, [setPopupNuevoVisible]);

  const hidePopup = useCallback(() => {
    setPopupNuevoVisible(false);
  }, [setPopupNuevoVisible]);

  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  async function guardarCertificado() {
    if (!selectedFile) {
      console.error('No se ha seleccionado ningún archivo');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:3500/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data);
      if (response.data.success == true) {
        var objSave = {
          LIBRO: 'TEST',
          FOLIO: '2024',
          NUMERO: '00001',
          CODALUMNO: '000070048987', 
          CURSO: 'TEST', 
          NOMBRE: '', 
          BASE64: '', 
          NOTA: '18', 
          ACTIVO: '1', 
          FECHA_CERT: '2024-09-15', 
          IDUSUARIO: 'FURIBE',
          BASE64: response.data.file.path
        }

        var xml = '<CERTIFICADO>\n'
        xml += objToXML(objSave)
        xml += '</CERTIFICADO>\n'
        console.log(xml)
        
        const { data } = await axios.post(rtCertificados, {
          METODO: 'CARGAR_CERTIFICADO',
          NRO_DOC: '',
          LIBRO: '',
          FOLIO: '',
          NUMERO: '',
          XMLDOC: xml,
        });
        console.log(data.data)
      }
    } catch (error) {
      console.error('Error al subir archivo', error);
    }

  }

  return (
    <>
      <div className="container mt-3">
        <div className="row justify-content-between">
          <div className="col-auto">
            <h5>Certificados</h5>
          </div>
          <div className="col-auto">
            <h5><button type="button" className="btn btn-primary btn-sm" onClick={() => { showNuevoPopup()}}>Nuevo</button></h5>
          </div>
        </div>
        
        <div className="card p-3">
          <div id="contentDg">
            <DataGrid
              height={"70vh"}
              dataSource={certificados}
              keyExpr="IDCERTIFICADO"
              showBorders={true}
              showRowLines={true}
              allowColumnResizing={true}
            >
              <Paging enabled={false} />
              <Selection mode="single" />
              <ColumnChooser enabled={true} />
              <ColumnFixing enabled={true} />
              <Scrolling
                mode="virtual"
                rowRenderingMode="virtual"
                useNative={true}
              />
              <HeaderFilter visible={true}>
                <Search enabled={true} />
              </HeaderFilter>
              <FilterRow visible={true} applyFilter={true} />
              <Column dataField="IDCERTIFICADO" visible={false} minWidth={100}/>
              <Column dataField="LIBRO" minWidth={80}/>
              <Column dataField="FOLIO" minWidth={80}/>
              <Column dataField="NUMERO" minWidth={100}/>
              <Column dataField="CURSO" minWidth={300}/>
              <Column dataField="NOTA" minWidth={80}/>
              <Column dataField="ACTIVO" minWidth={100}/>
              <Column dataField="CODALUMNO" visible={false} minWidth={100}/>
              <Column dataField="ALUMNO" minWidth={220}/>
              <Column dataField="FECHA_CREACION" caption="CREACION" minWidth={120}/> 
              <Column dataField="IDUSUARIO" minWidth={120}/> 
            </DataGrid>
          </div>
        </div>
      </div>

      
      <Popup
        maxWidth={800}
        maxHeight={'70vh'}
        height={'auto'}
        visible={popupNuevoVisible}
        onHiding={hidePopup}
        hideOnOutsideClick={true}
        showCloseButton={true}
        title='Nuevo certificado'>
        <div className="row px-2">
          <b className="px-1">DATOS DE ALUMNO</b>
          <div className="form-group col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">TIPO DOC</label>
            <select className="form-control custom-select" name="TP_DOC">
              <option value='DNI'>DNI</option>
            </select>
          </div>
          <div className="form-group col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">NRO DOC</label>
            <input type="text" className="form-control" name="NRO_DOC"/>
          </div>
          <div className="form-group col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">NOMBRES</label>
            <input type="text" className="form-control" name="NOMBRES"/>
          </div>
          <div className="form-group col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">APELLIDOS</label>
            <input type="text" className="form-control" name="APELLIDOS"/>
          </div>
          <div className="form-group col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">CORREO</label>
            <input type="text" className="form-control" name="CORREO"/>
          </div>
          <div className="form-group col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">NRO CELULAR</label>
            <input type="text" className="form-control" name="NRO_CELULAR"/>
          </div>
          
          <b className="px-1 mt-3">DATOS DEL CERTIFICADO</b>
          <div className="form-group col-xl-2 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">LIBRO</label>
            <input type="text" className="form-control" name="LIBRO"/>
          </div>
          <div className="form-group col-xl-2 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">FOLIO</label>
            <input type="text" className="form-control" name="FOLIO"/>
          </div>
          <div className="form-group col-xl-2 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">NUMERO</label>
            <input type="text" className="form-control" name="NUMERO"/>
          </div>
          <div className="form-group col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12 px-1 mb-2">
            <label className="m-0">CURSO</label>
            <input type="text" className="form-control" name="CURSO"/>
          </div>
          <div className="form-group col-xl-2 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">NOTA</label>
            <input type="number" className="form-control" name="NOTA"/>
          </div>
          <div className="form-group col-xl-4 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">FECHA</label>
            <input type="date" className="form-control" name="FECHA_CERT"/>
          </div>
          <div className="form-group col-xl-4 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">ARCHIVO</label>
            <input type="file" name="ARCHIVO" accept="application/pdf"/>
          </div>
          <div className="col-12 mt-3 px-1 mb-2 text-end">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => guardarCertificado()}>Guardar</button>
          </div>
          <div>
            <input type="file" accept="application/pdf" onChange={handleFileChange} />
          </div>
        </div>
      </Popup>
    </>
  )
}