import { useEffect, useState } from "react";
import axios from "axios";
import logo1 from '../assets/viact-c.png'
import logo2 from '../assets/unica-c.png'
import { IoHomeSharp } from "react-icons/io5";
import { MDBAccordion, MDBAccordionItem } from 'mdb-react-ui-kit';
import { rtCertificados } from "../utils/APIRoutes";
import { MDBInput } from 'mdb-react-ui-kit';
export default function Consulta() {
  const [activeAcrd, setActiveAcrd] = useState(1)
  const [certificados, setCertificados] = useState([])
  
  async function busqueda(tipo) {
    console.log()
    const { data } = await axios.post(rtCertificados, {
      params: {
        METODO: tipo == 'codigo' ? 'BUSCAR_POR_LIBRO_FOLIO_NUMERO' : 'BUSCAR_POR_NRO_DOC',
        NRO_DOC: txtDNI.value,
        LIBRO: txtCurso.value,
        FOLIO: txtLibro.value,
        NUMERO: txtFolio.value,
        XMLDOC: '',
      }
    });
    setCertificados(data)
    document.getElementById('resultadosMsg').classList.remove('text-danger')
    console.log(data)
    if (data.length >= 1) {
      document.getElementById('resultadosMsg').textContent = 'Resultados:'
      setCertificados(data)
    } else {
      document.getElementById('resultadosMsg').textContent = 'No se encontraron resultados'
    document.getElementById('resultadosMsg').classList.add('text-danger')
    }
    document.getElementById('colResult').classList.remove('d-none')
    setActiveAcrd(0)
  }

  return (
    <>
      <div className="container">
        <div className="row py-3 px-2" style={{ alignItems: 'center' }}>
          <div className="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-6 p-2">
            <img src={logo1} alt="VIACT" style={{ maxWidth: '100%' }} />
          </div>
          <div className="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-6 p-2">
            <img src={logo2} alt="UNICA" style={{ maxWidth: '100%' }} />
          </div>
          <div className="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-12 pt-2 text-center">
            <a href="https://viact.milaulas.com/login/index.php" target="a_blank" style={{fontSize:20, fontWeight: 700, textDecoration: 'none'}}>CAMPUS VIRTUAL</a>
          </div>
        </div>
      </div>
      <div className="bgGradient1">
        <div className="container text-end py-4 px-4">
          <h2 className="text-white mb-0" style={{ fontSize: 40, fontWeight: 700, fontStyle: 'italic' }}>Mi certificado</h2>
        </div>
      </div>
      <div style={{ backgroundColor: '#0096ed' }}>
        <div className="container pt-1 pb-1">
          <p className="text-white mb-0"><IoHomeSharp /> Busca tu certificado</p>
        </div>
      </div>
      <div className="container">
        <div className="row py-3 justify-content-center">
          <div className="col-xl-5 col-lg-6 col-md-6 col-sm-12 col-12">
            <MDBAccordion active={activeAcrd} onChange={(itemId) => setActiveAcrd(itemId)}>
              <MDBAccordionItem collapseId={1} headerTitle="Buscar por código">
                <div className="row">
                  <div className='form-group col-xl-3 col-lg-3 col-md-3 col-sm-4 col-4 px-1 mb-1'>
                    <MDBInput label="Lbro" id="txtCurso" type="text" size="sm" />
                  </div>
                  <div className='form-group col-xl-3 col-lg-3 col-md-3 col-sm-4 col-4 px-1 mb-1'>
                    <MDBInput label="Folio" id="txtLibro" type="text" size="sm" />
                  </div>
                  <div className='form-group col-xl-3 col-lg-3 col-md-3 col-sm-4 col-4 px-1 mb-1'>
                    <MDBInput label="Numero" id="txtFolio" type="text" size="sm" />
                  </div>
                  <div className='form-group col-xl-3 col-lg-3 col-md-3 col-sm-6 col-12 text-end px-1 mb-1'>
                    <button type='button' className='btn btn-primary btn-sm' onClick={() => busqueda('codigo')}>Buscar</button>
                  </div>

                  <small className='mt-2 px-1'><b>Ejemplo: </b> ING 2024 00001</small>
                </div>
              </MDBAccordionItem>
              <MDBAccordionItem collapseId={2} headerTitle="Buscar por DNI">
                <div className="row">
                  <div className='form-group col-xl-3 col-lg-6 col-md-6 col-sm-9 col-9 px-1'>
                    <MDBInput label="DNI" id="txtDNI" type="text" size="sm" />
                  </div>
                  <div className='form-group col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 px-1'>
                    <button type='button' className='btn btn-primary btn-sm btn-block' onClick={() => busqueda('dni')}>Buscar</button>
                  </div>
                </div>
              </MDBAccordionItem>
            </MDBAccordion>
          </div>
          <div className="col-xl-7 col-lg-6 col-md-6 col-sm-12 col-12 d-none" id="colResult">
            <p className="mb-1" id="resultadosMsg"></p>
            <div id="ctResultados">
              {certificados && certificados.length >= 1 ?
                <>
                  <span>
                    <b style={{color: '#d65617'}}>ALUMNO: </b>  
                    {certificados[0].NRO_DOC} - {certificados[0].NOMBRES} {certificados[0].APELLIDOS}
                  </span>
                  <div className="ctCards mt-2">
                    {certificados.map((cert, index) => {
                      return <div className="card mt-2 p-3" key={index}>
                        <div className="row justify-content-between">
                          <div className="col-auto">
                            <span>CODIGO: <b>{cert.LIBRO} {cert.FOLIO} {cert.NUMERO}</b></span>
                          </div>
                          <div className="col-auto">
                            <b style={{color: '#d65617'}}>{cert.FECHA_CERTIFICADO}</b>
                          </div>
                          <div className="col-12">
                            <span>CURSO: <b>{cert.CURSO}</b></span><br/>
                            <span>NOTA: <b>{cert.NOTA}</b></span>
                          </div>
                          <iframe
                            src={`http://localhost/apiViactCert/${cert.BASE64}`}
                            title={cert.CURSO}
                            width="100%"
                            height="500px"
                          />
                        </div>
                        
                      </div>
                    })}
                  </div>
                </>
                :
                <>
                  <b>No hay certificados disponibles</b>
                </>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}