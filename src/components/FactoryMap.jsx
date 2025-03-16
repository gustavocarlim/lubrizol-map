import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import mapa from "../assets/mapa2.png";
import icon1 from "../assets/box.png";
import icon2 from "../assets/brickwall.png";
import icon3 from "../assets/crisis.png";
import icon4 from "../assets/eco-friendly.png";
import icon5 from "../assets/flash.png";
import icon6 from "../assets/flask.png";
import icon7 from "../assets/mechanic.png";
import icon8 from "../assets/open-box.png";
import icon9 from "../assets/project.png";
import icon10 from "../assets/warning.png";
import black from "../assets/black.svg";
import red from "../assets/red.svg";
import blue from "../assets/blue.svg";
import green from "../assets/green.svg";
import yellow from "../assets/yellow.svg";
import orange from "../assets/orange.svg";
import purple from "../assets/purple.svg";
import brown from "../assets/brown.svg";
import white from "../assets/white.svg";  
import "leaflet.fullscreen";
import "../FactoryMap.css";





const fullBounds = [[-42, -83], [42, 83]];
const normalBounds = [[-35.40, -66.10], [35.40, 66.10]];

const AddPin = ({ onAddPin, isEditingMode }) => {
  useMapEvents({
    click(e) {
      if (isEditingMode) {
        onAddPin(e);
      }
    },
  });
  return null;
};

const icons = {
  "Box": icon1,
  "Brickwall": icon2,
  "Crisis": icon3,
  "Eco-friendly": icon4,
  "Flash": icon5,
  "Flask": icon6,
  "Mechanic": icon7,
  "Open Box": icon8,
  "Project": icon9,
  "Warning": icon10,
  "Black": black,
  "Red": red,
  "Blue":blue,
  "Green": green,
  "Yellow": yellow,
  "Orange": orange,
  "Purple": purple,
  "Brown": brown,
  "White": white,
};

Modal.setAppElement("#root");

const FactoryMap = () => {
  const [pins, setPins] = useState(JSON.parse(localStorage.getItem("pins")) || []);
  const [categories, setCategories] = useState(JSON.parse(localStorage.getItem("categories")) || {});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newIcon, setNewIcon] = useState(null);
  const [editingPinId, setEditingPinId] = useState(null);
  const [newDescription, setNewDescription] = useState("");
  const [isEditingMode, setIsEditingMode] = useState(false); // Modo de edição
  const [isMapMode, setIsMapMode] = useState(true); // Modo de exploração do mapa
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Controle de abertura do popup
  const [canAddPin, setCanAddPin] = useState(true); // Controle para permitir adicionar pinos
  const [currentBounds, setCurrentBounds] = useState(normalBounds);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const createIcon = (iconUrl) => {
    return L.icon({
      iconUrl,
      iconSize: [25, 25],
      iconAnchor: [13, 25],
      popupAnchor: [0, -2],
    });
  };

  const addPin = (e) => {
    if (!canAddPin || isPopupOpen) return; // Impede adição de pinos enquanto o popup está aberto ou se não puder adicionar
    if (!selectedCategory) return;
  
    const newPin = {
      id: Date.now(),
      position: e.latlng,
      description: "Novo Pino",
      category: selectedCategory,
    };
    const updatedPins = [...pins, newPin];
    setPins(updatedPins);
    localStorage.setItem("pins", JSON.stringify(updatedPins));
  };
  

  const updateDescription = (id, newDescription) => {
    const updatedPins = pins.map((pin) =>
      pin.id === id ? { ...pin, description: newDescription } : pin
    );
    setPins(updatedPins);
    localStorage.setItem("pins", JSON.stringify(updatedPins));
  };

  const clearPins = () => {
    setPins([]);
    localStorage.removeItem("pins");
  };

  const addCategory = () => {
    if (!newCategory.trim() || !newIcon) return;
    const updatedCategories = { ...categories, [newCategory]: newIcon };
    setCategories(updatedCategories);
    localStorage.setItem("categories", JSON.stringify(updatedCategories));
    setShowModal(false);
    setNewCategory("");
    setNewIcon(null);
  };

  const deleteCategory = (category) => {
    const updatedCategories = { ...categories };
    delete updatedCategories[category];

    const updatedPins = pins.filter((pin) => pin.category !== category);
    
    setCategories(updatedCategories);
    setPins(updatedPins);
    localStorage.setItem("categories", JSON.stringify(updatedCategories));
    localStorage.setItem("pins", JSON.stringify(updatedPins));
  };

  const editCategory = (category, newName) => {
    if (!newName.trim()) return;
    const updatedCategories = { ...categories };
    updatedCategories[newName] = updatedCategories[category];
    delete updatedCategories[category];
    setCategories(updatedCategories);
    localStorage.setItem("categories", JSON.stringify(updatedCategories));
  };

  const movePin = (id, newPosition) => {
    setPins(pins.map((pin) => (pin.id === id ? { ...pin, position: newPosition } : pin)));
  };

  const deletePin = (id) => {
    const updatedPins = pins.filter((pin) => pin.id !== id);
    setPins(updatedPins);
    localStorage.setItem("pins", JSON.stringify(updatedPins));
  };

  const startEditingPin = (pin) => {
    setEditingPinId(pin.id); // Define o pin que está sendo editado
    setNewDescription(pin.description); // Preenche a descrição do pin
    setIsPopupOpen(pin.id); // Abre o popup somente para o pin que está sendo editado
    setCanAddPin(false); // Desabilita a adição de pinos enquanto a edição está aberta
  };
  
  const saveDescription = (id) => {
    const updatedPin = { ...pins.find((pin) => pin.id === id), description: newDescription };
    
    // Atualiza o estado com a nova descrição
    const updatedPins = pins.map((pin) => (pin.id === id ? updatedPin : pin));
    setPins(updatedPins);
    
    // Salva a lista de pinos atualizada no localStorage
    localStorage.setItem("pins", JSON.stringify(updatedPins));
  
    setIsPopupOpen(null); // Fecha o popup após salvar
    setEditingPinId(null); // Reseta o ID do pin em edição
    setCanAddPin(true); // Permite a adição de pinos após o popup ser fechado
  };

  const togglePopup = (id) => {
    setIsPopupOpen(id);
  };

  const generateShareableLink = () => {
    const data = { pins, categories };
    const encodedData = encodeURIComponent(JSON.stringify(data));
    const shareableURL = `${window.location.origin}?data=${encodedData}`;
  
    navigator.clipboard.writeText(shareableURL)
      .then(() => alert("Link copiado para a área de transferência!"))
      .catch(err => console.error("Erro ao copiar o link:", err));
  };
  


  useEffect(() => {
    // Alterna o modo de edição ao pressionar "M"
    const handleKeyDown = (event) => {
      if (event.key === "m" || event.key === "M") {
        setIsEditingMode((prevState) => !prevState);
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
  
    // Lê os parâmetros da URL para carregar os pinos e categorias compartilhados
    const params = new URLSearchParams(window.location.search);
    const encodedData = params.get("data");
  
    if (encodedData) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(encodedData));
        if (decodedData.pins) {
          setPins(decodedData.pins);
        }
        if (decodedData.categories) {
          setCategories(decodedData.categories);
        }
      } catch (error) {
        console.error("Erro ao decodificar os dados:", error);
      }
    }
  
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      if (document.fullscreenElement) {
        setCurrentBounds(fullBounds); // Ajusta o mapa
        setIsFullScreen(true); // Atualiza o estado
      } else {
        setCurrentBounds(normalBounds); // Volta ao normal
        setIsFullScreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);


  return (
    <div className="all">

      {/* Indicador do modo atual */}
      <div className="modos">
        <h2>{isEditingMode ? "Modo de Edição de Marcadores" : "Modo de Exploração do Mapa"}</h2>
      </div>
      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 1050,
          },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "15px",
            backgroundColor: "white",
            borderRadius: "10px",
            width: "650px",
            height: "auto",
          },
        }}
      >
        <h2>Adicionar Legenda</h2>
        <input
          type="text"
          placeholder="Nome da legenda"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <div className="icon-grid">
          {Object.entries(icons).map(([name, icon]) => (
            <img
              key={name}
              src={icon}
              alt={name}
              onClick={() => setNewIcon(icon)}
              style={{
                border: newIcon === icon ? "2px solid blue" : "none",
                cursor: "pointer",
                width: "40px",
                height: "40px",
              }}
            />
          ))}
        </div>
        <button onClick={addCategory}>Salvar</button>
        <button onClick={() => setShowModal(false)}>Cancelar</button>
      </Modal>

      <div className="main-container">
        <div className="legend-list">
          <div className="legendas-title">
            LEGENDAS
          </div>
          {Object.keys(categories).map((category) => (
            <div
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "selected-category" : ""}
            >
              <img src={categories[category]} alt={category} /> {category}
              <button onClick={() => deleteCategory(category)}>Excluir</button>
            </div>
          ))}
        <div className="botoes">
        <button onClick={() => setShowModal(true)}>Adicionar Legenda</button>
        <button onClick={clearPins} style={{ marginLeft: "10px" }}>Limpar Pinos</button>
        </div>
        <button onClick={generateShareableLink}>Gerar Link Compartilhável</button>
        </div>
        <div className="other-content">
          <MapContainer
            center={[0, 0]}
            zoom={4}
            minZoom={3.9}
            maxZoom={8}
            maxBounds={currentBounds}
            maxBoundsViscosity={1.0}
            // style={{ width: "100%", height: "100%" }}
            style={{ height: "93vh", width: "82vw", position: "relative", zIndex: 1 }}
            fullscreenControl={true} 
          >
            <ImageOverlay url={mapa} bounds={currentBounds} />
            {pins.map((pin) => (
              <Marker
                key={pin.id}
                position={pin.position}
                icon={createIcon(categories[pin.category])}
                draggable={isEditingMode} 
                eventHandlers={{
                  dragend(e) {
                    if (isEditingMode) {
                      movePin(pin.id, e.target.getLatLng());
                    }
                  },
                }}
              >
              <Popup closeOnEscapeKey={false} closeOnClick={false}>
                {editingPinId === pin.id ? (
                  <div onClick={(event) => event.stopPropagation()}> {/* Evita propagação do clique */}
                    <input
                      type="text"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                    />
                    <button onClick={(event) => { 
                      event.stopPropagation(); 
                      saveDescription(pin.id); 
                    }}>
                      Salvar
                    </button>
                  </div>
                ) : (
                  <div onClick={(event) => event.stopPropagation()}> {/* Evita propagação do clique */}
                    <p>{pin.description}</p>
                    {isEditingMode && (
                      <>
                        <button onClick={(event) => { 
                          event.stopPropagation(); 
                          startEditingPin(pin); 
                        }}>
                          Editar
                        </button>
                        <button onClick={(event) => { 
                          event.stopPropagation(); 
                          deletePin(pin.id); 
                        }}>
                          Excluir
                        </button>
                      </>
                    )}
                  </div>
                )}
              </Popup>
              </Marker>
            ))}
            <AddPin onAddPin={addPin} isEditingMode={isEditingMode} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default FactoryMap;
