// src/components/SponsorsScreen.jsx
import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import logoAneel from '../assets/logos/aneel.png';
import logoUfpa from '../assets/logos/ufpa.png';
import logoFadesp from '../assets/logos/fadesp.png';
import logoWeg from '../assets/logos/weg.png';
import logoGhport from '../assets/logos/ghport.png';
import logoGtnav from '../assets/logos/gtnav.png';
import logoCemazon from '../assets/logos/ceamazon.png';

import logoNorteEnergia from '../assets/logos/norteenergia.svg';

const sponsorLogos = [
  { name: 'ANEEL', logo: logoAneel },
  { name: 'UFPA', logo: logoUfpa },
  { name: 'FADESP', logo: logoFadesp },
  { name: 'WEG', logo: logoWeg },
  { name: 'GH Port', logo: logoGhport },
  { name: 'GTNAV', logo: logoGtnav },
  { name: 'CEMAZON', logo: logoCemazon },
];

const SponsorsScreen = ({ onFinished }) => {
  const { t } = useTranslation();
  const [checks, setChecks] = useState([]);
  const [progress, setProgress] = useState(0);

  const systemChecks = useMemo(() => [
    t('initializing_kernel'),
    t('connecting_telemetry'),
    t('checking_sensors'),
    t('calibrating_compass'),
    t('loading_interface'),
    t('ready'),
  ], [t]);

  const totalDuration = 6000;
  const checkInterval = totalDuration / (systemChecks.length + 1);

  useEffect(() => {
    const checkTimer = setInterval(() => {
      setChecks(prevChecks => {
        if (prevChecks.length < systemChecks.length) {
          return [...prevChecks, systemChecks[prevChecks.length]];
        }
        return prevChecks;
      });
    }, checkInterval);

    const progressTimer = setInterval(() => {
      setProgress(prev => Math.min(prev + 100 / (totalDuration / 100), 100));
    }, 100);

    const finishTimer = setTimeout(() => {
      onFinished();
    }, totalDuration);

    return () => {
      clearInterval(checkTimer);
      clearInterval(progressTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinished, checkInterval, systemChecks]);

  // Estilos dinâmicos para animações
  const styleSheet = `
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; translateY(0); } }
    @keyframes scanline { 0% { transform: translateY(-10%); } 100% { transform: translateY(110%); } }
    .system-check-item { opacity: 0; animation: fadeInUp 0.5s ease-out forwards; }
    .sponsor-logo { transition: transform 0.3s ease, filter 0.3s ease; }
    .sponsor-logo:hover { transform: scale(1.1); filter: grayscale(0%) brightness(1); }
  `;

  // Objeto de estilos usando variáveis CSS do seu tema
  const styles = {
    container: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'var(--background-primary)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Roboto Mono', 'Consolas', monospace", overflow: 'hidden', zIndex: 9999, },
    scanline: { position: 'absolute', top: 0, left: 0, right: 0, height: '100px', backgroundColor: 'rgba(0, 167, 157, 0.05)', animation: 'scanline 10s linear infinite', },
    mainContent: { zIndex: 1, textAlign: 'left', width: '100%', maxWidth: '600px', padding: '1rem' },
    logoContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '30px' },
    mainLogo: { width: 'auto', maxHeight: '120px', maxWidth: '80%'}, // Estilo para a sua logo principal
    bootSequence: { minHeight: '180px', fontSize: '1rem', },
    progressBarContainer: { width: '100%', height: '4px', backgroundColor: 'var(--background-nav)', borderRadius: '2px', marginTop: '20px', overflow: 'hidden', },
    progressBar: { height: '100%', backgroundColor: 'var(--button-save-bg)', borderRadius: '2px', transition: 'width 0.1s linear', boxShadow: '0 0 10px var(--button-save-bg)', },
    footer: { position: 'absolute', bottom: '30px', width: '100%', textAlign: 'center', zIndex: 1, },
    footerText: { fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '15px', },
    sponsorsLogos: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', flexWrap: 'wrap' },
    sponsorImage: { maxHeight: '40px', maxWidth: '120px', objectFit: 'contain', filter: 'grayscale(100%) brightness(3)', opacity: 0.8 }
  };

  return (
    <>
      <style>{styleSheet}</style>
      <div style={styles.container}>
        <div style={styles.scanline}></div>
        <div style={styles.mainContent}>
          <div style={styles.logoContainer}>
            {/* Usando a sua logo principal aqui */}
            <img src={logoNorteEnergia} alt="Logo Norte Energia" style={styles.mainLogo} />
          </div>
          <div style={styles.bootSequence}>
            {checks.map((check, index) => (
              <p key={index} className="system-check-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <span style={{ color: check === t('ready') ? 'var(--button-save-bg)' : 'var(--text-secondary)' }}>
                  {check === t('ready') ? '✓ ' : '» '}
                </span>
                {check}
              </p>
            ))}
          </div>
          <div style={styles.progressBarContainer}>
            <div style={{...styles.progressBar, width: `${progress}%`}}></div>
          </div>
        </div>
        <footer style={styles.footer}>
          <p style={styles.footerText}>{t('supported_by')}</p>
          <div style={styles.sponsorsLogos}>
            {sponsorLogos.map((sponsor) => (
              <img key={sponsor.name} className="sponsor-logo" src={sponsor.logo} alt={sponsor.name} style={styles.sponsorImage} />
            ))}
          </div>
        </footer>
      </div>
    </>
  );
};

SponsorsScreen.propTypes = {
  onFinished: PropTypes.func.isRequired,
};

export default SponsorsScreen;
