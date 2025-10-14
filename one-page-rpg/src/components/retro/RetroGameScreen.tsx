import React, { useEffect, useRef } from 'react';

/**
 * RetroGameScreen - 1280x720 usando RPGUI nativo
 */
export const RetroGameScreen: React.FC = () => {
  const hpBarRef = useRef<HTMLDivElement>(null);
  const mpBarRef = useRef<HTMLDivElement>(null);
  const expBarRef = useRef<HTMLDivElement>(null);
  
  // CSS para sobrescribir position: fixed de RPGUI
  const containerStyle: React.CSSProperties = {
    position: 'relative' as const,
    zIndex: 1
  };

  useEffect(() => {
    // Inicializar barras RPGUI
    if (typeof window !== 'undefined' && (window as any).RPGUI) {
      setTimeout(() => {
        if (hpBarRef.current) (window as any).RPGUI.set_value(hpBarRef.current, 1.0);
        if (mpBarRef.current) (window as any).RPGUI.set_value(mpBarRef.current, 0.5);
        if (expBarRef.current) (window as any).RPGUI.set_value(expBarRef.current, 0.625);
      }, 200);
    }
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#262223',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden'
    }}>
      {/* RPGUI Content wrapper */}
      <div className="rpgui-content" style={{ width: '1280px', maxHeight: '95vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header con barras personalizadas */}
        <div style={{
          backgroundColor: '#3a3536',
          borderBottom: '4px solid #554c4d',
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Título con nombre de campaña + botón info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ color: '#e5e0e1', fontSize: '13px', fontWeight: 'bold', margin: 0 }}>La Búsqueda del Sol Perdido</h2>
            <button 
              className="rpgui-button" 
              type="button" 
              style={{ 
                padding: '0',
                minWidth: 'auto',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                lineHeight: '1'
              }}
            >
              <p style={{ margin: 0 }}>i</p>
            </button>
          </div>

          {/* Barras HP/MP/EXP personalizadas estilo retro */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ color: '#e5e0e1', fontSize: '9px', minWidth: '24px', fontWeight: 'bold' }}>HP:</label>
              <div style={{
                width: '80px',
                height: '14px',
                backgroundColor: '#1a1a1a',
                border: '2px solid #554c4d',
                position: 'relative',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: '100%',
                  backgroundColor: '#dc2626',
                  boxShadow: '0 0 4px rgba(220, 38, 38, 0.6)'
                }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ color: '#e5e0e1', fontSize: '9px', minWidth: '24px', fontWeight: 'bold' }}>MP:</label>
              <div style={{
                width: '80px',
                height: '14px',
                backgroundColor: '#1a1a1a',
                border: '2px solid #554c4d',
                position: 'relative',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: '50%',
                  backgroundColor: '#2563eb',
                  boxShadow: '0 0 4px rgba(37, 99, 235, 0.6)'
                }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ color: '#e5e0e1', fontSize: '9px', minWidth: '24px', fontWeight: 'bold' }}>EXP:</label>
              <div style={{
                width: '80px',
                height: '14px',
                backgroundColor: '#1a1a1a',
                border: '2px solid #554c4d',
                position: 'relative',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: '62%',
                  backgroundColor: '#16a34a',
                  boxShadow: '0 0 4px rgba(22, 163, 74, 0.6)'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '250px 1fr 250px',
          gap: '16px',
          padding: '16px',
          minHeight: '550px',
          alignItems: 'start'
        }}>
          
          {/* COLUMNA 1: Character + Quest */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="rpgui-container framed" style={containerStyle}>
              {/* Avatar */}
              <div style={{
                width: '160px',
                height: '160px',
                margin: '12px auto',
                backgroundColor: '#1a1a1a',
                border: '2px solid #554c4d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '64px'
              }}>
                👨‍⚖️
              </div>
              <div style={{ fontSize: '9px', lineHeight: '1.8', textAlign: 'center' }}>
                <p><strong>Sir Kael</strong></p>
                <p>Lvl 10 Paladin</p>
                <hr style={{ margin: '8px 0' }} />
                <div style={{ textAlign: 'left' }}>
                  <p>STR: 18 | DEX: 12</p>
                  <p>INT: 14 | CON: 16</p>
                </div>
              </div>
            </div>

            <div className="rpgui-container framed-grey" style={containerStyle}>
              <h3 style={{ fontSize: '11px', marginBottom: '8px' }}>Quest Log</h3>
              <hr />
              <div style={{ fontSize: '9px', lineHeight: '1.8', marginTop: '8px' }}>
                <p style={{ color: '#fbbf24' }}>[Active] The Sunstone</p>
                <p style={{ color: '#9ca3af' }}>- Find the lost relic</p>
              </div>
            </div>
            
            {/* Contenedor extra debajo de Quest Log */}
            <div className="rpgui-container framed-golden" style={{ ...containerStyle, minHeight: '160px' }}>
              {/* Placeholder para uso futuro */}
            </div>
          </div>

          {/* COLUMNA 2: Scene + Narrative */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Scene Display - Reducido 30% */}
            <div id="scene-container" className="rpgui-container framed-golden" style={{ ...containerStyle, flex: '0 0 auto' }}>
              <h3 style={{ fontSize: '12px', marginBottom: '8px' }}>Whispering Woods</h3>
              <hr className="golden" />
              <div style={{
                marginTop: '12px',
                height: '280px',
                backgroundColor: '#1a1a1a',
                border: '2px solid #444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <p style={{ fontSize: '12px', color: '#666' }}>🌲 Scene Image (280px tall) 🌲</p>
              </div>
            </div>

            {/* Narrative Panel - Sin título, más alto */}
            <div id="narrative-container" className="rpgui-container framed" style={{ ...containerStyle, minHeight: '320px' }}>
              <p style={{ fontSize: '10px', marginTop: '8px', lineHeight: '1.8' }}>
                The wind howls through the ancient trees, carrying whispers of forgotten tales. 
                You stand at the edge of the Whispering Woods. Ancient runes glow faintly on the bark, 
                and you sense a presence watching from the shadows.
              </p>
            </div>
          </div>

          {/* COLUMNA 3: Inventory + contenedor extra */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="rpgui-container framed-grey" style={containerStyle}>
              <h3 style={{ fontSize: '11px', marginBottom: '8px' }}>Inventory</h3>
              <hr />
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginTop: '12px',
                height: '300px',
                alignContent: 'start'
              }}>
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      aspectRatio: '1',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      border: '2px solid #1a1718',
                      boxShadow: 'inset 2px 2px 0px rgba(0,0,0,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}
                  >
                    {i === 0 && '⚔️'}
                    {i === 1 && '🛡️'}
                    {i === 2 && '🧪'}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Contenedor extra debajo del inventario - Alineado con narrativa */}
            <div className="rpgui-container framed-golden" style={{ ...containerStyle, minHeight: '320px' }}>
              {/* Placeholder para uso futuro */}
            </div>
          </div>
        </div>

        {/* Footer - Muy Compacto */}
        <div style={{ borderTop: '4px solid #554c4d', backgroundColor: '#3a3536' }}>
          <div style={{ 
            padding: '4px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}>
            <input
              type="text"
              placeholder="Enter command..."
              style={{
                flex: '1',
                backgroundColor: '#262223',
                color: '#e5e0e1',
                border: '2px solid #554c4d',
                padding: '4px 8px',
                fontSize: '9px',
                outline: 'none',
                height: '22px'
              }}
            />
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="rpgui-button" type="button" style={{ padding: '0px 6px', minHeight: 'auto', height: '21px', lineHeight: '21px' }}><p style={{ fontSize: '8px', margin: 0 }}>Save</p></button>
              <button className="rpgui-button" type="button" style={{ padding: '0px 6px', minHeight: 'auto', height: '21px', lineHeight: '21px' }}><p style={{ fontSize: '8px', margin: 0 }}>Load</p></button>
              <button className="rpgui-button" type="button" style={{ padding: '0px 6px', minHeight: 'auto', height: '21px', lineHeight: '21px' }}><p style={{ fontSize: '8px', margin: 0 }}>Options</p></button>
            </div>
          </div>
          <div style={{
            padding: '2px 16px',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            fontSize: '7px',
            color: '#928587',
            borderTop: '2px solid #554c4d',
            height: '18px'
          }}>
            <span>v0.1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetroGameScreen;
