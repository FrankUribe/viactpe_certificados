import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { rtCertificados, rtLogin, rtUpload } from "../utils/APIRoutes";
import { formatDateDesde, formatDateHasta, objToXML } from "../utils/functions";
import { DataGrid, Popup, Toolbar } from "devextreme-react";
import { Column, Editing, FilterRow, HeaderFilter, Scrolling, Search, Selection, ColumnChooser, ColumnFixing, Button, Paging, Item } from "devextreme-react/data-grid";
import { locale, loadMessages } from 'devextreme/localization';
import esMessages from 'devextreme/localization/messages/es.json';
import { setCookie, getCookie, cookieExists, eraseCookie } from "../utils/functions";
import { useNavigate } from 'react-router-dom';
import Notify from 'devextreme/ui/notify';
locale('es');
loadMessages(esMessages);
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import { IoLogOutOutline,IoPencil  } from "react-icons/io5";

export default function Certificados() {
	const navigate = useNavigate()
  const [certificados, setCertificados] = useState([])
  const [popupNuevoVisible, setPopupNuevoVisible] = useState(false);
  const [popupEditVisible, setPopupEditVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  
  const showToast = (tipo, mensaje) => {
    Notify({
      message: mensaje,
      height: 45,
      width: 250,
      minWidth: 280,
      type: tipo,
      displayTime: 4000,
      animation: {
        show: { type: 'fade', duration: 300, from: 0, to: 1,},
        hide: { type: 'fade', duration: 300, from: 1, to: 0 },
      },
    }, {
      position: 'top right'
    });
  };

  async function traerCertificados() {
    const { data } = await axios.post(rtCertificados, {
      params: {
        METODO: 'LISTAR_CERTIFICADOS',
        NRO_DOC: fechas.DESDE.replaceAll('-',''),
        LIBRO: '',
        FOLIO: '',
        NUMERO: '',
        XMLDOC: fechas.HASTA.replaceAll('-',''),
      }
    });
    setCertificados(data)
    console.log(data)
  }

  //VALIDAR USUARIO
  useEffect(() => {
		if (cookieExists('authVIACT')) {
			const localuser = JSON.parse(getCookie('authVIACT'));
			if (localuser.USUARIO && localuser.CONTRA) {
				async function consultUser() {
          var requestData = {
            params: {
              USUARIO: localuser.USUARIO,
              CONTRA: localuser.CONTRA,
							cookieAccess: true
            }
          };
          const { data } = await axios.post(rtLogin, requestData, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
					// console.log(data)
					if (data[0].RESULTADO == '1') {
            setCurrentUser(data[0])
					} else {
						navigate("/login");
            eraseCookie('authVIACT')
          }
				}
				consultUser()
			} else {
        navigate("/login");
        eraseCookie('authVIACT')
      }
		} else{
      navigate("/login");
    }
	}, [])

  useEffect(() => {
		traerCertificados()
	}, [])
  
  const showNuevoPopup = useCallback(() => {
    setPopupNuevoVisible(true);
  }, [setPopupNuevoVisible]);
  
  const showEditPopup = useCallback(() => {
    setPopupEditVisible(true);
  }, [setPopupEditVisible]);

  const hidePopup = useCallback(() => {
    setPopupNuevoVisible(false);
    setPopupEditVisible(false)
  }, [setPopupNuevoVisible]);

  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  async function guardarCertificado() {    
    var NRO_DOC = document.getElementById('NRO_DOC').value
    var NOMBRES = document.getElementById('NOMBRES').value
    var APELLIDOS = document.getElementById('APELLIDOS').value
    var CORREO = document.getElementById('CORREO').value
    var NRO_CELULAR = document.getElementById('NRO_CELULAR').value

    var LIBRO = document.getElementById('LIBRO').value
    var FOLIO = document.getElementById('FOLIO').value
    var NUMERO = document.getElementById('NUMERO').value
    var CURSO = document.getElementById('CURSO').value
    var NOTA = document.getElementById('NOTA').value
    var FECHA_CERT = document.getElementById('FECHA_CERT').value
    if (NRO_DOC.length != 8) {
      showToast('error','El nro de documento debe ser de 8 dígitos')
      return;
    }
    if (NRO_DOC == '' || NOMBRES == '' || APELLIDOS == '' || CORREO == '' || NRO_CELULAR == '') {
      showToast('error','Complete datos de alumno')
      return;
    }
    if (LIBRO == '' || FOLIO == '' || NUMERO == '' || CURSO == '' || NOTA == '' || FECHA_CERT == '') {
      showToast('error','Complete datos del certificado')
      return;
    }
    
    if (!selectedFile) {
      showToast('error','No ha seleccionado algun archivo')
      return;
    }
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    var objAlumno = {
      CODALUMNO: NRO_DOC,
      TP_DOC: document.getElementById('TP_DOC').value,
      NRO_DOC: NRO_DOC,
      NOMBRES: NOMBRES,
      APELLIDOS: APELLIDOS,
      FECHA_NAC: '',
      CORREO: CORREO,
      NRO_CELULAR: NRO_CELULAR,
      ACTIVO: 1
    }
    var xmlAlumno = '<ALUMNO>\n'
    xmlAlumno += objToXML(objAlumno)
    xmlAlumno += '</ALUMNO>\n'
    console.log(xmlAlumno)
    const { data } = await axios.post(rtCertificados, {
      params: {
        METODO: 'CREAR_ALUMNO',
        NRO_DOC: NRO_DOC,
        LIBRO: '',
        FOLIO: '',
        NUMERO: '',
        XMLDOC: xmlAlumno,
      }
    });
    if (data[0].RESULTADO == '0') {
      showToast('error',data[0].MSG)
    }else{
      // showToast('info',data.data[0].MSG)
      var CODALUMNO = data[0].CODALUMNO
      try {
        const response = await axios.post(rtUpload, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(response.data);
        if (response.data.success == true) {
          var objSave = {
            LIBRO: LIBRO,
            FOLIO: FOLIO,
            NUMERO: NUMERO,
            CODALUMNO: CODALUMNO, 
            CURSO: CURSO, 
            NOMBRE: '',  
            NOTA: NOTA, 
            ACTIVO: '1', 
            FECHA_CERT: FECHA_CERT, 
            IDUSUARIO: currentUser.USUARIO,
            BASE64: response.data.file
          }
  
          var xml = '<CERTIFICADO>\n'
          xml += objToXML(objSave)
          xml += '</CERTIFICADO>\n'
          console.log(xml)
          
          const { data } = await axios.post(rtCertificados, {
            params: {
              METODO: 'CARGAR_CERTIFICADO',
              NRO_DOC: '',
              LIBRO: '',
              FOLIO: '',
              NUMERO: '',
              XMLDOC: xml,
            }
          });
          if (data[0].RESULTADO == '0') {
            showToast('error',data[0].MSG)
          }else{
            showToast('success',data[0].MSG)
            document.getElementById('NRO_DOC').value = ''
            document.getElementById('NOMBRES').value = ''
            document.getElementById('APELLIDOS').value = ''
            document.getElementById('CORREO').value = ''
            document.getElementById('NRO_CELULAR').value = ''
        
            document.getElementById('LIBRO').value = ''
            document.getElementById('FOLIO').value = ''
            document.getElementById('NUMERO').value = ''
            document.getElementById('CURSO').value = ''
            document.getElementById('NOTA').value = ''
            document.getElementById('FECHA_CERT').value = ''
            setSelectedFile(null)
            hidePopup()
            traerCertificados()
          }
        }
      } catch (error) {
        showToast('error','Error al subir archivo')
      }
    }
  }

  const [nroDoc, setNroDoc] = useState('');

  const handleChangeNroDoc = (event) => {
    const value = event.target.value;
    // Solo permitir números
    if (/^\d*$/.test(value)) {
      setNroDoc(value);
    }
    if(nroDoc.length == 8){
      var encontrado = certificados.filter(f => f.NRO_DOC == nroDoc)
      document.getElementById('NOMBRES').value = ''
      document.getElementById('APELLIDOS').value = ''
      document.getElementById('CORREO').value = ''
      document.getElementById('NRO_CELULAR').value = ''
      if (encontrado.length >= 1) {
        document.getElementById('NOMBRES').value = encontrado[0].NOMBRES
        document.getElementById('APELLIDOS').value = encontrado[0].APELLIDOS
        document.getElementById('CORREO').value = encontrado[0].CORREO
        document.getElementById('NRO_CELULAR').value = encontrado[0].NRO_CELULAR
      }
    }
  };

  
  const handleChangeNroDocEdit = (event) => {
    const value = event.target.value;
    // Solo permitir números
    if (/^\d*$/.test(value)) {
      setNroDoc(value);
    }
    document.getElementById('editNOMBRES').value = ''
    document.getElementById('editAPELLIDOS').value = ''
    document.getElementById('editCORREO').value = ''
    document.getElementById('editNRO_CELULAR').value = ''
    if(nroDoc.length == 8){
      var encontrado = certificados.filter(f => f.NRO_DOC == nroDoc)
      if (encontrado.length >= 1) {
        document.getElementById('editNOMBRES').value = encontrado[0].NOMBRES
        document.getElementById('editAPELLIDOS').value = encontrado[0].APELLIDOS
        document.getElementById('editCORREO').value = encontrado[0].CORREO
        document.getElementById('editNRO_CELULAR').value = encontrado[0].NRO_CELULAR
      }
    }
  };

  const handleCheckboxChange = async (rowData, newValue) => {
    // console.log(rowData, newValue)
    const { data } = await axios.post(rtCertificados, {
      params: {
        METODO: 'ESTADO_CERTIFICADO',
        NRO_DOC: '',
        LIBRO: '',
        FOLIO: '',
        NUMERO: '',
        XMLDOC: rowData.IDCERTIFICADO,
      }
    });
    console.log(data)
    if (data[0].RESULTADO == '0') {
      showToast('error',data[0].MSG)
      traerCertificados()
    } else{
      var CERTS = certificados
      CERTS.forEach(obj => {
        if (obj.IDCERTIFICADO == rowData.IDCERTIFICADO) {
          obj.ACTIVO = (newValue ? 1 : 0)
        }
      })
      traerCertificados()
    }
  };
  const renderActivoCheckbox = (cellData) => {
    // console.log(cellData)
    return (
      <input
        type="checkbox"
        checked={cellData.value === '1'}
        onChange={(e) => handleCheckboxChange(cellData.data, e.target.checked)}
      />
    );
  };

  const [fechas, setFechas] = useState(
    { 
      DESDE: formatDateDesde(),
      HASTA: formatDateHasta()
    }
  )
  const handleInputDateChange = (e) => {
    const { name, value } = e.target;
    setFechas((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleVer = (rowData) => {
    setPopupEditVisible(true)
    console.log('Trayendo detalles', rowData);
    setTimeout(() => {
      document.getElementById('editIDCERTIFICADO').value = rowData.IDCERTIFICADO
      document.getElementById('editNRO_DOC').value = rowData.NRO_DOC
      document.getElementById('editNOMBRES').value = rowData.APELLIDOS
      document.getElementById('editAPELLIDOS').value = rowData.APELLIDOS
      document.getElementById('editCORREO').value = rowData.CORREO
      document.getElementById('editNRO_CELULAR').value = rowData.NRO_CELULAR
  
      document.getElementById('editLIBRO').value = rowData.LIBRO
      document.getElementById('editFOLIO').value = rowData.FOLIO
      document.getElementById('editNUMERO').value = rowData.NUMERO
      document.getElementById('editCURSO').value = rowData.CURSO
      document.getElementById('editNOTA').value = rowData.NOTA
      document.getElementById('editFECHA_CERT').value = rowData.FECHA_CERTIFICADO.split('/').reverse().join('-')

      document.getElementById('frameCert').src = `https://apicertificados.viact.pe/${rowData.BASE64}`
    }, 200);
  };

  const renderButtons = (cellData) => (
    <div className="text-center">
      <button className="btn btn-sm btn-info" style={{padding: '1px 5px'}} onClick={() => handleVer(cellData.data)}><IoPencil style={{fontSize: 15, marginTop: '-3px'}}/></button>
    </div>
  );

  async function guardarEdicionCertificado() {    
    var IDCERTIFICADO = document.getElementById('editIDCERTIFICADO').value
    var NRO_DOC = document.getElementById('editNRO_DOC').value
    var NOMBRES = document.getElementById('editNOMBRES').value
    var APELLIDOS = document.getElementById('editAPELLIDOS').value
    var CORREO = document.getElementById('editCORREO').value
    var NRO_CELULAR = document.getElementById('editNRO_CELULAR').value

    var LIBRO = document.getElementById('editLIBRO').value
    var FOLIO = document.getElementById('editFOLIO').value
    var NUMERO = document.getElementById('editNUMERO').value
    var CURSO = document.getElementById('editCURSO').value
    var NOTA = document.getElementById('editNOTA').value
    var FECHA_CERT = document.getElementById('editFECHA_CERT').value
    if (NRO_DOC.length != 8) {
      showToast('error','El nro de documento debe ser de 8 dígitos')
      return;
    }
    if (NRO_DOC == '' || NOMBRES == '' || APELLIDOS == '' || CORREO == '' || NRO_CELULAR == '') {
      showToast('error','Complete datos de alumno')
      return;
    }
    if (LIBRO == '' || FOLIO == '' || NUMERO == '' || CURSO == '' || NOTA == '' || FECHA_CERT == '') {
      showToast('error','Complete datos del certificado')
      return;
    }
    
    var objAlumno = {
      CODALUMNO: NRO_DOC,
      TP_DOC: document.getElementById('editTP_DOC').value,
      NRO_DOC: NRO_DOC,
      NOMBRES: NOMBRES,
      APELLIDOS: APELLIDOS,
      FECHA_NAC: '',
      CORREO: CORREO,
      NRO_CELULAR: NRO_CELULAR,
      ACTIVO: 1
    }
    var xmlAlumno = '<ALUMNO>\n'
    xmlAlumno += objToXML(objAlumno)
    xmlAlumno += '</ALUMNO>\n'
    console.log(xmlAlumno)
    const { data } = await axios.post(rtCertificados, {
      params: {
        METODO: 'CREAR_ALUMNO',
        NRO_DOC: NRO_DOC,
        LIBRO: '',
        FOLIO: '',
        NUMERO: '',
        XMLDOC: xmlAlumno,
      }
    });
    console.log(data[0])
    if (data[0].RESULTADO == '0') {
      showToast('error',data[0].MSG)
    }else{
      showToast('info',data[0].MSG)
      var CODALUMNO = data[0].CODALUMNO
      var objSave = {
        IDCERTIFICADO: IDCERTIFICADO,
        LIBRO: LIBRO,
        FOLIO: FOLIO,
        NUMERO: NUMERO,
        CODALUMNO: CODALUMNO, 
        CURSO: CURSO, 
        NOMBRE: '',  
        NOTA: NOTA, 
        ACTIVO: '1', 
        FECHA_CERT: FECHA_CERT, 
      }

      var xml = '<CERTIFICADO>\n'
      xml += objToXML(objSave)
      xml += '</CERTIFICADO>\n'
      console.log(xml)
      
      const response = await axios.post(rtCertificados, {
        params: {
          METODO: 'EDIT_CERTIFICADO',
          NRO_DOC: '',
          LIBRO: '',
          FOLIO: '',
          NUMERO: '',
          XMLDOC: xml,
        }
      });
      console.log(response.data)
      if (response.data[0].RESULTADO == '0') {
        showToast('error',response.data[0].MSG)
      }else{
        showToast('success',response.data[0].MSG)
        document.getElementById('editNRO_DOC').value = ''
        document.getElementById('editNOMBRES').value = ''
        document.getElementById('editAPELLIDOS').value = ''
        document.getElementById('editCORREO').value = ''
        document.getElementById('editNRO_CELULAR').value = ''
    
        document.getElementById('editLIBRO').value = ''
        document.getElementById('editFOLIO').value = ''
        document.getElementById('editNUMERO').value = ''
        document.getElementById('editCURSO').value = ''
        document.getElementById('editNOTA').value = ''
        document.getElementById('editFECHA_CERT').value = ''
        setSelectedFile(null)
        hidePopup()
        traerCertificados()
      }
    }
  }

  const cerrarSesion = () => {
    navigate("/login");
    eraseCookie('authVIACT')
  }

  return (
    <>
      <div className="container mt-3">
        <div className="row justify-content-between">
          <div className="col-auto">
            <h5 className="mb-0">Certificados</h5>
          </div>
          <div className="col-auto">
            <div className="row px-2 justify-content-end">
              <div className="col-xl-auto col-lg-auto col-md-3 col-sm-6 col-6 form-group mb-2 px-1">
                <label className="m-0">Desde</label>
                <input type="date" className="form-control" name="DESDE" value={fechas.DESDE} onChange={handleInputDateChange} max={formatDateHasta()}/>
              </div>
              <div className="col-xl-auto col-lg-auto col-md-3 col-sm-6 col-6 form-group mb-2 px-1">
                <label className="m-0">Hasta</label>
                <input type="date" className="form-control" name="HASTA" value={fechas.HASTA} onChange={handleInputDateChange} max={formatDateHasta()}/>
              </div>
              <div className="col-auto form-group mb-2 px-1 text-end">
                <label className="m-0 d-md-block d-sm-block">&nbsp;</label>
                <button type="button" className="btn btn-sm btn-success" onClick={() => traerCertificados()}>Buscar</button>
              </div>
              <div className="col-auto form-group mb-2 px-1 text-end">
                <label className="m-0 d-md-block d-sm-block">&nbsp;</label>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => { showNuevoPopup()}}>Nuevo</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card p-2">
          <div id="contentDg">
            <DataGrid
              height={"65vh"}
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
              <Column dataField="NOTA" minWidth={60} allowFiltering={false}/>
              <Column dataField="FECHA_CERTIFICADO" caption="FECHA" minWidth={110}/> 
              <Column
                dataField="ACTIVO"
                minWidth={70}
                alignment="center"
                allowFiltering={false}
                cellRender={renderActivoCheckbox}
              />
              <Column dataField="CODALUMNO" visible={false} minWidth={100}/>
              <Column dataField="NRO_DOC" minWidth={110}/>
              <Column dataField="ALUMNO" minWidth={220}/>
              <Column dataField="FECHA_CREACION" caption="CREACION" minWidth={120}/> 
              <Column dataField="IDUSUARIO" minWidth={120}/> 
              <Column width={50} cellRender={renderButtons} fixed={true} fixedPosition="right"/>
            </DataGrid>
          </div>
        </div>

        <div className="text-end mt-2">
          <button type="button" className="btn btn-sm btn-danger" onClick={() => cerrarSesion()}><IoLogOutOutline style={{fontSize: 15, marginTop: '-3px'}}/> Cerrar sesión</button>
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
            <select className="form-control custom-select" name="TP_DOC" id="TP_DOC">
              <option value='DNI'>DNI</option>
            </select>
          </div>
          <div className="form-group col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">NRO DOC</label>
            <input type="text" className="form-control" name="NRO_DOC" id="NRO_DOC" value={nroDoc} onKeyUp={handleChangeNroDoc} onChange={handleChangeNroDoc}/>
          </div>
          <div className="form-group col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">NOMBRES</label>
            <input type="text" className="form-control" name="NOMBRES" id="NOMBRES"/>
          </div>
          <div className="form-group col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">APELLIDOS</label>
            <input type="text" className="form-control" name="APELLIDOS" id="APELLIDOS"/>
          </div>
          <div className="form-group col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">CORREO</label>
            <input type="text" className="form-control" name="CORREO" id="CORREO"/>
          </div>
          <div className="form-group col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">NRO CELULAR</label>
            <input type="text" className="form-control" name="NRO_CELULAR" id="NRO_CELULAR"/>
          </div>
          
          <b className="px-1 mt-3">DATOS DEL CERTIFICADO</b>
          <div className="form-group col-xl-2 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">LIBRO</label>
            <input type="text" className="form-control" name="LIBRO" id="LIBRO"/>
          </div>
          <div className="form-group col-xl-2 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">FOLIO</label>
            <input type="text" className="form-control" name="FOLIO" id="FOLIO"/>
          </div>
          <div className="form-group col-xl-2 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">NUMERO</label>
            <input type="text" className="form-control" name="NUMERO" id="NUMERO"/>
          </div>
          <div className="form-group col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12 px-1 mb-2">
            <label className="m-0">CURSO</label>
            <input type="text" className="form-control" name="CURSO" id="CURSO"/>
          </div>
          <div className="form-group col-xl-2 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">NOTA</label>
            <input type="number" className="form-control" name="NOTA" id="NOTA"/>
          </div>
          <div className="form-group col-xl-4 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">FECHA</label>
            <input type="date" className="form-control" name="FECHA_CERT" id="FECHA_CERT"/>
          </div>
          <div className="form-group col-xl-4 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">ARCHIVO</label>
            <input type="file" name="ARCHIVO" accept="application/pdf" id="ARCHIVO" onChange={handleFileChange}/>
          </div>
          <div className="col-12 mt-3 px-1 mb-2 text-end">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => guardarCertificado()}>Guardar</button>
          </div>
        </div>
      </Popup>

      
      <Popup
        maxWidth={800}
        maxHeight={'70vh'}
        height={'auto'}
        visible={popupEditVisible}
        onHiding={hidePopup}
        hideOnOutsideClick={true}
        showCloseButton={true}
        title='Editar certificado'>
        <div className="row px-2">
          <p className="p-1 mt-0 mb-2" style={{fontSize: 10}}><b>Importante:</b> La edición solo permite cambiar de datos, no de archivo, si desea cambiar el archivo, desactive el actual y cree uno nuevo.</p>
          <b className="px-1">DATOS DE ALUMNO</b>
          <div className="form-group col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">TIPO DOC</label>
            <select className="form-control custom-select" name="editTP_DOC" id="editTP_DOC">
              <option value='DNI'>DNI</option>
            </select>
          </div>
          <div className="form-group col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">NRO DOC</label>
            <input type="text" className="form-control" name="editNRO_DOC" id="editNRO_DOC" value={nroDoc} onKeyUp={handleChangeNroDocEdit} onChange={handleChangeNroDocEdit}/>
          </div>
          <div className="form-group col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">NOMBRES</label>
            <input type="text" className="form-control" name="editNOMBRES" id="editNOMBRES"/>
          </div>
          <div className="form-group col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">APELLIDOS</label>
            <input type="text" className="form-control" name="editAPELLIDOS" id="editAPELLIDOS"/>
          </div>
          <div className="form-group col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">CORREO</label>
            <input type="text" className="form-control" name="editCORREO" id="editCORREO"/>
          </div>
          <div className="form-group col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">NRO CELULAR</label>
            <input type="text" className="form-control" name="editNRO_CELULAR" id="editNRO_CELULAR"/>
          </div>
          
          <b className="px-1 mt-3">DATOS DEL CERTIFICADO</b>
          <input type="hidden" disabled="" className="form-control" name="editIDCERTIFICADO" id="editIDCERTIFICADO"/>
          <div className="form-group col-xl-2 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">LIBRO</label>
            <input type="text" className="form-control" name="editLIBRO" id="editLIBRO"/>
          </div>
          <div className="form-group col-xl-2 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">FOLIO</label>
            <input type="text" className="form-control" name="editFOLIO" id="editFOLIO"/>
          </div>
          <div className="form-group col-xl-2 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">NUMERO</label>
            <input type="text" className="form-control" name="editNUMERO" id="editNUMERO"/>
          </div>
          <div className="form-group col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12 px-1 mb-2">
            <label className="m-0">CURSO</label>
            <input type="text" className="form-control" name="editCURSO" id="editCURSO"/>
          </div>
          <div className="form-group col-xl-2 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">NOTA</label>
            <input type="number" className="form-control" name="editNOTA" id="editNOTA"/>
          </div>
          <div className="form-group col-xl-4 col-lg-4 col-md-6 col-sm-6 col-6 px-1 mb-2">
            <label className="m-0">FECHA</label>
            <input type="date" className="form-control" name="editFECHA_CERT" id="editFECHA_CERT"/>
          </div>
          <div className="col-12 mt-3 px-1 mb-2 text-end">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => guardarEdicionCertificado()}>Guardar</button>
          </div>
          <iframe id="frameCert"
            // src={`https://apicertificados.viact.pe/${cert.BASE64}`}
            width="100%"
            height="500px"
          />
        </div>
      </Popup>
    </>
  )
}