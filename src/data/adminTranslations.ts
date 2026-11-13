import { SupportedLanguage } from '../types/kiosk';

export interface AdminTranslationStrings {
  // Header & Common
  pinSecured: string;
  backToKiosk: string;
  publicPortal: string;
  adminTitle: string;
  adminSub: string;
  adminLangLabel: string;
  passengerLangLabel: string;
  activeProfile: string;
  clearRequest: string;
  signOut: string;
  daylightMode: string;
  nightMode: string;
  soundEnabled: string;
  soundMuted: string;
  saveChanges: string;
  cancel: string;
  deleteBtn: string;
  editBtn: string;
  addBtn: string;
  showBtn: string;
  hideBtn: string;
  acknowledge: string;
  handled: string;
  speakAloud: string;

  // Overview (Resumen) & Quick Admin Android Apps
  overviewWelcome: string;
  fleetOperatingNormal: string;
  launchScreensaver: string;
  openSandbox: string;
  adminAppsTitle: string;
  adminAppsSub: string;
  customizeAdminApps: string;
  addAdminApp: string;
  resetDefaultApps: string;
  editAdminApp: string;
  appNameLabel: string;
  appSubtitleLabel: string;
  appEmojiLabel: string;
  appPackageLabel: string;
  appDeepLinkLabel: string;
  appWebUrlLabel: string;
  appColorLabel: string;
  tapToOpenApp: string;
  statActiveDrivers: string;
  statProfilesSuffix: string;
  statDriversDesc: string;
  statPassengerReqs: string;
  statPendingSuffix: string;
  statAllCompleted: string;
  statImmediateAttn: string;
  statGalleries: string;
  statAlbumsSuffix: string;
  statPhotosOrganized: string;
  statQuickConnects: string;
  statPortalsSuffix: string;
  statVisiblePassengers: string;
  pushAnnouncementTitle: string;
  pushAnnouncementSub: string;
  pushAnnouncementPlaceholder: string;
  broadcastToTablets: string;

  // Backup & Restore Center
  backupTitle: string;
  backupSub: string;
  backupScopeTitle: string;
  scopeFull: string;
  scopeFullDesc: string;
  scopeConfig: string;
  scopeConfigDesc: string;
  scopeHistory: string;
  scopeHistoryDesc: string;
  exportToDeviceBtn: string;
  saveCloudSnapshotBtn: string;
  restoreCloudSnapshotBtn: string;
  uploadExternalTitle: string;
  uploadExternalSub: string;
  selectBackupFileBtn: string;
  dropBackupHint: string;
  previewLoadedBackup: string;
  restoreConfigCheck: string;
  restoreHistoryCheck: string;
  applyExternalBackupBtn: string;
  discardPreviewBtn: string;
  cloudVaultTitle: string;
  lastCloudBackup: string;
  noCloudBackupYet: string;
  includedSummaryTitle: string;

  // Passenger Requests Tab
  requestsTitle: string;
  requestsSub: string;
  clearResolved: string;
  clearRequestsAll: string;
  cabinComfortTitle: string;
  totalLabel: string;
  noCabinRequests: string;
  newRequestBadge: string;
  acknowledgedBadge: string;
  quickReplyLabel: string;
  jukeboxRequestsTitle: string;
  noSongRequests: string;
  acceptAndQueue: string;
  markPlayed: string;
  playedBadge: string;

  // Drivers Tab
  driversTitle: string;
  driversSub: string;
  addAdditionalDriver: string;
  profileBackupTitle: string;
  profileBackupSub: string;
  staffRolesHierarchy: string;
  allRolesFilter: string;
  editProfile: string;
  activeOnKiosk: string;
  setAsActive: string;
  bioLabel: string;

  // Apps Manager Tab
  appsManagerTitle: string;
  appsManagerSub: string;
  restoreDefaults: string;
  addNewButton: string;

  // Quick Connect Tab
  quickConnectManagerTitle: string;
  quickConnectManagerSub: string;
  addQuickConnect: string;

  // Galleries Tab
  galleriesTitle: string;
  galleriesSub: string;
  addPhoto: string;
  createNewAlbum: string;
  activeAlbums: string;
  allAlbums: string;
  photosIn: string;

  // Screensaver, Tablets, Inquiries, Team Chat, Security
  screensaverTitle: string;
  screensaverSub: string;
  previewScreensaver: string;
  fleetTabletsTitle: string;
  fleetTabletsSub: string;
  triggerScreensaver: string;
  pingTablet: string;
  inquiriesTitle: string;
  inquiriesSub: string;
  callClient: string;
  teamChatTitle: string;
  teamChatSub: string;
  sendMessage: string;
  securityTitle: string;
  securitySub: string;
  selectProfilePin: string;
  activePinFor: string;
  updatePinFor: string;
  savePinToProfile: string;
  finishedAdminTitle: string;
  finishedAdminSub: string;
  lockAndSignOut: string;

  // Sub-module Banner Titles & Key Actions
  controllerTitle: string;
  controllerSub: string;
  shiftCalTitle: string;
  shiftCalSub: string;
  analyticsTitle: string;
  analyticsSub: string;
  generateReport: string;
  feedbackTitle: string;
  feedbackSub: string;
  announcementsTitle: string;
  announcementsSub: string;
  marketingTitle: string;
  marketingSub: string;
  checklistsTitle: string;
  checklistsSub: string;
  recoveryTitle: string;
  recoverySub: string;
  historyTitle: string;
  historySub: string;
  translationsTitle: string;
  translationsSub: string;
  sandboxTitle: string;
  sandboxSub: string;
  sandboxLaunchFullscreen: string;
}

export const ADMIN_TRANSLATIONS: Record<SupportedLanguage, AdminTranslationStrings> = {
  en: {
    pinSecured: '4-PIN Secured',
    backToKiosk: 'Passenger Portal',
    publicPortal: 'Public Portal',
    adminTitle: 'Silvermyst Command Center',
    adminSub: 'Remote Fleet Administration & Content Management',
    adminLangLabel: 'Admin Language',
    passengerLangLabel: 'Passenger Language',
    activeProfile: 'Active Profile',
    clearRequest: 'CLEAR REQUEST',
    signOut: 'Sign Out',
    daylightMode: 'Switch to Daylight Mode',
    nightMode: 'Switch to Night Dim Mode',
    soundEnabled: 'Sound Chimes Enabled',
    soundMuted: 'Sound Muted',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    deleteBtn: 'Delete',
    editBtn: 'Edit',
    addBtn: 'Add',
    showBtn: 'Show',
    hideBtn: 'Hide',
    acknowledge: 'Acknowledge',
    handled: 'Handled',
    speakAloud: 'Speak',

    overviewWelcome: 'Welcome back',
    fleetOperatingNormal: 'Silvermyst Multiservices in-cabin passenger fleet is operating normally.',
    launchScreensaver: 'Launch Screensaver',
    openSandbox: 'Open Sandbox Simulator',
    adminAppsTitle: 'Driver & Admin Android Quick Apps',
    adminAppsSub: '1-tap access to your personal driver apps (Spotify, YouTube, Maps, Waze) — customize freely.',
    customizeAdminApps: 'Customize Apps',
    addAdminApp: 'Add Android App',
    resetDefaultApps: 'Reset Defaults',
    editAdminApp: 'Edit Admin App',
    appNameLabel: 'App Name',
    appSubtitleLabel: 'Short Subtitle',
    appEmojiLabel: 'Emoji / Icon Badge',
    appPackageLabel: 'Android Package Name',
    appDeepLinkLabel: 'Deep Link / Intent URI',
    appWebUrlLabel: 'Web Fallback URL',
    appColorLabel: 'Button Color',
    tapToOpenApp: 'Tap to Open',
    statActiveDrivers: 'Active Drivers',
    statProfilesSuffix: 'Profiles',
    statDriversDesc: 'Customizable Fleet & PINs',
    statPassengerReqs: 'Passenger Requests',
    statPendingSuffix: 'Pending',
    statAllCompleted: 'All requests completed',
    statImmediateAttn: 'Immediate attention needed',
    statGalleries: 'Photo Galleries',
    statAlbumsSuffix: 'Albums',
    statPhotosOrganized: 'total organized pictures',
    statQuickConnects: 'Quick Connects',
    statPortalsSuffix: 'Portals',
    statVisiblePassengers: 'visible to passengers',
    pushAnnouncementTitle: 'Push Passenger Announcement',
    pushAnnouncementSub: 'Broadcast an in-cabin message banner directly to all passenger 10-inch tablets in real-time.',
    pushAnnouncementPlaceholder: 'e.g. Welcome aboard! Chilled spring water and phone chargers are right behind the front seats.',
    broadcastToTablets: 'Broadcast to Tablets',

    backupTitle: 'Configuration & Historical Backups',
    backupSub: 'Create complete configuration and historical snapshots, export to device storage, or load an external backup file.',
    backupScopeTitle: 'Select Backup Scope',
    scopeFull: 'Full System (Config + History)',
    scopeFullDesc: 'All profiles, PINs, apps, themes, shifts, requests, analytics & logs',
    scopeConfig: 'Configuration Only',
    scopeConfigDesc: 'Drivers, PINs, passenger & admin apps, Quick Connects, galleries & themes',
    scopeHistory: 'Historical Records Only',
    scopeHistoryDesc: 'Work shifts, shift swap requests, passenger requests, feedback & analytics',
    exportToDeviceBtn: 'Export & Save to Device Storage',
    saveCloudSnapshotBtn: 'Save Snapshot to Cloud Vault',
    restoreCloudSnapshotBtn: 'Load Latest Cloud Snapshot',
    uploadExternalTitle: 'Upload & Load External Backup',
    uploadExternalSub: 'Choose a previously exported .json backup file from your tablet, phone, USB, or computer storage.',
    selectBackupFileBtn: 'Choose Backup File (.json)',
    dropBackupHint: 'or drag & drop your Silvermyst backup file here',
    previewLoadedBackup: 'Backup File Ready to Load',
    restoreConfigCheck: 'Restore Configuration (Profiles, PINs, Apps, Themes & Settings)',
    restoreHistoryCheck: 'Restore Historical Records (Shifts, Requests, Feedback & Analytics)',
    applyExternalBackupBtn: 'Load & Apply Selected Data',
    discardPreviewBtn: 'Cancel Preview',
    cloudVaultTitle: 'Cloud Backup Vault Status',
    lastCloudBackup: 'Last Cloud Snapshot',
    noCloudBackupYet: 'No complete cloud snapshot saved yet.',
    includedSummaryTitle: 'Current Live System Inventory Ready to Export',

    requestsTitle: 'Real-Time Passenger Requests',
    requestsSub: 'Live stream of passenger song requests and comfort adjustments from the 10-inch kiosk.',
    clearResolved: 'Clear Resolved',
    clearRequestsAll: 'CLEAR REQUESTS',
    cabinComfortTitle: 'Cabin Comfort & Assistance',
    totalLabel: 'total',
    noCabinRequests: 'No cabin requests yet.',
    newRequestBadge: 'New Request',
    acknowledgedBadge: 'Acknowledged',
    quickReplyLabel: 'Quick Reply:',
    jukeboxRequestsTitle: 'In-Cabin Jukebox Song Requests',
    noSongRequests: 'No song requests queued.',
    acceptAndQueue: 'Accept & Queue',
    markPlayed: 'Mark Played',
    playedBadge: 'Played',

    driversTitle: 'Driver Profiles & Fleet Roster',
    driversSub: 'Add unlimited driver profiles with custom PINs & photos, edit or organize drivers, and backup settings.',
    addAdditionalDriver: 'Add Additional Driver',
    profileBackupTitle: 'Profile Settings Backup & Restore',
    profileBackupSub: 'Save a snapshot of all driver profiles, photos, and PINs to Cloud or export a JSON file.',
    staffRolesHierarchy: 'Staff Roles & Hierarchy',
    allRolesFilter: 'All',
    editProfile: 'Edit Profile',
    activeOnKiosk: 'Active on Kiosk',
    setAsActive: 'Set as Active',
    bioLabel: 'Bio:',

    appsManagerTitle: 'Tablet App & Button Manager',
    appsManagerSub: 'Add unlimited buttons, edit existing apps, reorder launcher layout, and control passenger visibility.',
    restoreDefaults: 'Restore Defaults',
    addNewButton: 'Add New Button',

    quickConnectManagerTitle: 'Quick Connect & Tap-to-Scan Manager',
    quickConnectManagerSub: 'Add custom payment options, social links, and scannable QR cards displayed in the passenger dock.',
    addQuickConnect: 'Add Quick Connect',

    galleriesTitle: 'Photo Galleries & Album Organizer',
    galleriesSub: 'Create customized photo albums, delete albums, reorder them, and organize in-cabin photos.',
    addPhoto: 'Add Photo',
    createNewAlbum: 'Create New Album',
    activeAlbums: 'Active Albums',
    allAlbums: 'All Albums',
    photosIn: 'Photos in',

    screensaverTitle: 'Inactivity Screensaver & Advertising',
    screensaverSub: 'Controls the full-screen photo slideshow shown on tablets when passenger touch activity stops.',
    previewScreensaver: 'Preview Screensaver',
    fleetTabletsTitle: 'Passenger Tablet Kiosks & Fleet',
    fleetTabletsSub: 'Monitor and remotely control Samsung 10-inch Android tablets installed in passenger cabins.',
    triggerScreensaver: 'Trigger Screensaver',
    pingTablet: 'Ping Tablet',
    inquiriesTitle: 'Passenger Multiservice Inquiries',
    inquiriesSub: 'Track direct passenger booking requests and IT/web/notary service leads submitted from the kiosk.',
    callClient: 'Call',
    teamChatTitle: 'Internal Driver & Admin Communication',
    teamChatSub: 'Real-time coordination channel for drivers, managers, and administrators.',
    sendMessage: 'Send',
    securityTitle: 'Profile-Specific Admin Security PIN',
    securitySub: 'Each driver profile has its own 4-digit PIN (default 0000). Saved permanently per profile.',
    selectProfilePin: 'Select Driver Profile to Configure PIN',
    activePinFor: 'Active PIN for',
    updatePinFor: 'Update PIN for',
    savePinToProfile: 'Save PIN to Profile',
    finishedAdminTitle: 'Finished with Administration?',
    finishedAdminSub: 'Sign out to clear current passenger requests, lock the portal, and expand Showcase fullscreen.',
    lockAndSignOut: 'Lock & Sign Out',

    controllerTitle: 'Fleet & Passenger Experience Controller',
    controllerSub: 'Synchronize active drivers, visibility toggles, and remote tablet actions across the entire fleet.',
    shiftCalTitle: 'Driver Working Shift Calendar & Reports',
    shiftCalSub: 'Drag drivers onto dates, print/email/text schedules, sync Google Calendar, and approve shift swaps.',
    analyticsTitle: 'Usage Analytics & Printable Fleet Reports',
    analyticsSub: 'Run daily, weekly, or monthly fleet & passenger analytics reports with CSV export and printing.',
    generateReport: 'Run Report',
    feedbackTitle: 'Passenger Reviews & Private Feedback',
    feedbackSub: 'Confidential passenger ratings, compliment badges, and suggestions submitted from the in-vehicle tablet.',
    announcementsTitle: 'Remote Announcements & Scheduled Broadcasts',
    announcementsSub: 'Push live banners or schedule future messages for passenger tablets.',
    marketingTitle: 'Marketing Pop-Ups & Cabin Color Themes',
    marketingSub: 'Create holiday or game-day pop-ups with audio chimes and configure default cabin color themes.',
    checklistsTitle: 'Pre-Shift Readiness Checklists',
    checklistsSub: 'Verify tablet battery, Wi-Fi hotspot, water, chargers, and vehicle sanitization daily.',
    recoveryTitle: 'Remote Kiosk Recovery & Device Health',
    recoverySub: 'Check tablet connectivity, force cloud sync, clear cache, or reload kiosk displays remotely.',
    historyTitle: 'Change History & Configuration Rollback',
    historySub: 'Audit trail of administrator edits with 1-tap rollback to previous saved states.',
    translationsTitle: 'Bilingual Translation Manager (EN / ES)',
    translationsSub: 'Customize passenger-facing bilingual phrases and sync updates to all tablets.',
    sandboxTitle: 'Live Kiosk Sandbox Environment',
    sandboxSub: 'Preview exactly how buttons, photos, and themes appear to passengers before publishing.',
    sandboxLaunchFullscreen: 'Launch Fullscreen on This Screen →',
  },
  es: {
    pinSecured: 'Protegido PIN-4',
    backToKiosk: 'Portal Pasajero',
    publicPortal: 'Portal Público',
    adminTitle: 'Centro de Control Silvermyst',
    adminSub: 'Administración Remota de Flota y Contenido',
    adminLangLabel: 'Idioma Admin',
    passengerLangLabel: 'Idioma Pasajero',
    activeProfile: 'Perfil Activo',
    clearRequest: 'LIMPIAR PETICIONES',
    signOut: 'Cerrar Sesión',
    daylightMode: 'Cambiar a Modo Día',
    nightMode: 'Cambiar a Modo Noche',
    soundEnabled: 'Sonidos Activados',
    soundMuted: 'Silenciado',
    saveChanges: 'Guardar Cambios',
    cancel: 'Cancelar',
    deleteBtn: 'Eliminar',
    editBtn: 'Editar',
    addBtn: 'Agregar',
    showBtn: 'Mostrar',
    hideBtn: 'Ocultar',
    acknowledge: 'Confirmar',
    handled: 'Atendido',
    speakAloud: 'Leer en voz alta',

    overviewWelcome: 'Bienvenido de nuevo',
    fleetOperatingNormal: 'La flota de pasajeros Silvermyst Multiservices está operando con normalidad.',
    launchScreensaver: 'Iniciar Protector',
    openSandbox: 'Abrir Simulador',
    adminAppsTitle: 'Apps Android Rápidas del Chofer y Admin',
    adminAppsSub: 'Acceso en 1 toque a tus apps personales (Spotify, YouTube, Maps, Waze) — personalízalas a tu gusto.',
    customizeAdminApps: 'Personalizar Apps',
    addAdminApp: 'Agregar App Android',
    resetDefaultApps: 'Restablecer Predeterminadas',
    editAdminApp: 'Editar App de Admin',
    appNameLabel: 'Nombre de la App',
    appSubtitleLabel: 'Subtítulo Corto',
    appEmojiLabel: 'Emoji / Ícono',
    appPackageLabel: 'Paquete Android (Package)',
    appDeepLinkLabel: 'Enlace Directo / Intent URI',
    appWebUrlLabel: 'URL Web Alternativa',
    appColorLabel: 'Color del Botón',
    tapToOpenApp: 'Tocar para Abrir',
    statActiveDrivers: 'Choferes Activos',
    statProfilesSuffix: 'Perfiles',
    statDriversDesc: 'Flota y PINs Personalizables',
    statPassengerReqs: 'Peticiones Pasajero',
    statPendingSuffix: 'Pendientes',
    statAllCompleted: 'Todas las peticiones completadas',
    statImmediateAttn: 'Requiere atención inmediata',
    statGalleries: 'Galerías de Fotos',
    statAlbumsSuffix: 'Álbumes',
    statPhotosOrganized: 'fotos organizadas en total',
    statQuickConnects: 'Conexión Rápida',
    statPortalsSuffix: 'Portales',
    statVisiblePassengers: 'visibles para pasajeros',
    pushAnnouncementTitle: 'Enviar Anuncio al Pasajero',
    pushAnnouncementSub: 'Envía un banner de mensaje en cabina directamente a todas las tablets en tiempo real.',
    pushAnnouncementPlaceholder: 'ej. ¡Bienvenidos a bordo! Agua fría y cables de carga están disponibles frente a ustedes.',
    broadcastToTablets: 'Enviar a Tablets',

    backupTitle: 'Respaldos de Configuración e Historial',
    backupSub: 'Crea copias completas de configuración e historial, expórtalas a tu dispositivo o carga un archivo externo.',
    backupScopeTitle: 'Seleccionar Alcance del Respaldo',
    scopeFull: 'Sistema Completo (Config + Historial)',
    scopeFullDesc: 'Todos los perfiles, PINs, apps, temas, turnos, peticiones, analítica y registros',
    scopeConfig: 'Solo Configuración',
    scopeConfigDesc: 'Choferes, PINs, apps de pasajero y admin, pagos QR, galerías y temas',
    scopeHistory: 'Solo Registros Históricos',
    scopeHistoryDesc: 'Turnos de trabajo, cambios de turno, peticiones, opiniones y analítica',
    exportToDeviceBtn: 'Exportar y Guardar en Dispositivo',
    saveCloudSnapshotBtn: 'Guardar Respaldo en la Nube',
    restoreCloudSnapshotBtn: 'Cargar Último Respaldo Nube',
    uploadExternalTitle: 'Subir y Cargar Respaldo Externo',
    uploadExternalSub: 'Selecciona un archivo .json exportado desde la memoria de tu tablet, teléfono, USB o computadora.',
    selectBackupFileBtn: 'Elegir Archivo de Respaldo (.json)',
    dropBackupHint: 'o arrastra y suelta aquí tu archivo de respaldo Silvermyst',
    previewLoadedBackup: 'Archivo de Respaldo Listo para Cargar',
    restoreConfigCheck: 'Restaurar Configuración (Perfiles, PINs, Apps, Temas y Ajustes)',
    restoreHistoryCheck: 'Restaurar Historial (Turnos, Peticiones, Opiniones y Analítica)',
    applyExternalBackupBtn: 'Cargar y Aplicar Datos Seleccionados',
    discardPreviewBtn: 'Cancelar Vista Previa',
    cloudVaultTitle: 'Estado de Bóveda en la Nube',
    lastCloudBackup: 'Última Copia en la Nube',
    noCloudBackupYet: 'Aún no hay copia completa en la nube.',
    includedSummaryTitle: 'Inventario Actual del Sistema Listo para Exportar',

    requestsTitle: 'Peticiones del Pasajero en Tiempo Real',
    requestsSub: 'Transmisión en vivo de canciones y ajustes de comodidad desde la tablet de 10 pulgadas.',
    clearResolved: 'Limpiar Atendidas',
    clearRequestsAll: 'LIMPIAR PETICIONES',
    cabinComfortTitle: 'Comodidad en Cabina y Asistencia',
    totalLabel: 'en total',
    noCabinRequests: 'Aún no hay peticiones en cabina.',
    newRequestBadge: 'Nueva Petición',
    acknowledgedBadge: 'Confirmada',
    quickReplyLabel: 'Respuesta Rápida:',
    jukeboxRequestsTitle: 'Peticiones de Música en Cabina',
    noSongRequests: 'No hay canciones en cola.',
    acceptAndQueue: 'Aceptar y Poner',
    markPlayed: 'Marcar Reproducida',
    playedBadge: 'Reproducida',

    driversTitle: 'Perfiles de Choferes y Personal',
    driversSub: 'Agrega choferes ilimitados con sus propios PINs y fotos, edita roles y respalda configuraciones.',
    addAdditionalDriver: 'Agregar Nuevo Chofer',
    profileBackupTitle: 'Respaldo y Restauración de Perfiles',
    profileBackupSub: 'Guarda una copia de todos los perfiles, fotos y PINs en la Nube o exporta un JSON.',
    staffRolesHierarchy: 'Roles y Jerarquía del Personal',
    allRolesFilter: 'Todos',
    editProfile: 'Editar Perfil',
    activeOnKiosk: 'Activo en Kiosco',
    setAsActive: 'Poner Activo',
    bioLabel: 'Biografía:',

    appsManagerTitle: 'Gestor de Apps y Botones de Tablet',
    appsManagerSub: 'Agrega botones ilimitados, edita apps, reordena el lanzador y controla lo que ve el pasajero.',
    restoreDefaults: 'Restaurar Predeterminados',
    addNewButton: 'Agregar Botón',

    quickConnectManagerTitle: 'Gestor de Conexión Rápida y QR',
    quickConnectManagerSub: 'Configura pagos, redes sociales y códigos QR escaneables para la pantalla del pasajero.',
    addQuickConnect: 'Agregar Enlace QR',

    galleriesTitle: 'Galerías de Fotos y Álbumes',
    galleriesSub: 'Crea álbumes personalizados, ordénalos y organiza las fotos mostradas en cabina.',
    addPhoto: 'Agregar Foto',
    createNewAlbum: 'Crear Álbum',
    activeAlbums: 'Álbumes Activos',
    allAlbums: 'Todos los Álbumes',
    photosIn: 'Fotos en',

    screensaverTitle: 'Protector de Pantalla y Publicidad',
    screensaverSub: 'Controla la presentación automática cuando no hay actividad táctil del pasajero.',
    previewScreensaver: 'Vista Previa',
    fleetTabletsTitle: 'Kioscos y Tablets de Flota',
    fleetTabletsSub: 'Monitorea y controla remotamente las tablets Samsung instaladas en cada vehículo.',
    triggerScreensaver: 'Activar Protector',
    pingTablet: 'Verificar Tablet',
    inquiriesTitle: 'Cotizaciones y Consultas de Servicio',
    inquiriesSub: 'Seguimiento a reservas directas y solicitudes de soporte técnico, web o notaría.',
    callClient: 'Llamar',
    teamChatTitle: 'Comunicación Interna del Equipo',
    teamChatSub: 'Canal en tiempo real entre choferes, gerentes y administradores.',
    sendMessage: 'Enviar',
    securityTitle: 'PIN de Seguridad por Perfil',
    securitySub: 'Cada perfil tiene su propio PIN de 4 dígitos (por defecto 0000). Guardado permanentemente.',
    selectProfilePin: 'Seleccionar Perfil para Configurar PIN',
    activePinFor: 'PIN Activo para',
    updatePinFor: 'Actualizar PIN para',
    savePinToProfile: 'Guardar PIN en el Perfil',
    finishedAdminTitle: '¿Terminaste con la Administración?',
    finishedAdminSub: 'Cierra sesión para limpiar peticiones actuales, bloquear el portal y volver a pantalla completa.',
    lockAndSignOut: 'Bloquear y Cerrar Sesión',

    controllerTitle: 'Controlador de Flota y Experiencia',
    controllerSub: 'Sincroniza choferes activos, botones visibles y acciones remotas en toda la flota.',
    shiftCalTitle: 'Calendario de Turnos y Reportes',
    shiftCalSub: 'Arrastra choferes al calendario, imprime/envía por correo o SMS, sincroniza Google Calendar y aprueba cambios.',
    analyticsTitle: 'Analítica de Uso y Reportes Imprimibles',
    analyticsSub: 'Genera reportes diarios, semanales o mensuales con exportación CSV e impresión.',
    generateReport: 'Generar Reporte',
    feedbackTitle: 'Reseñas y Opiniones Privadas',
    feedbackSub: 'Calificaciones confidenciales y sugerencias enviadas desde la tablet en cabina.',
    announcementsTitle: 'Anuncios Remotos y Programación',
    announcementsSub: 'Envía avisos en vivo o programa mensajes futuros para las tablets de pasajeros.',
    marketingTitle: 'Promociones Pop-Up y Temas de Color',
    marketingSub: 'Crea avisos festivos o deportivos con sonido y define el tema de color del vehículo.',
    checklistsTitle: 'Lista de Revisión de Turno',
    checklistsSub: 'Verifica batería de tablet, Wi-Fi, agua fría, cargadores y limpieza diaria.',
    recoveryTitle: 'Recuperación Remota y Salud de Tablets',
    recoverySub: 'Verifica conexión, fuerza sincronización o recarga la pantalla del kiosco remotamente.',
    historyTitle: 'Historial de Cambios y Restauración',
    historySub: 'Registro de cambios de administradores con restauración en 1 toque.',
    translationsTitle: 'Gestor de Traducciones (EN / ES)',
    translationsSub: 'Personaliza textos bilingües de la pantalla de pasajeros.',
    sandboxTitle: 'Simulador en Vivo del Kiosco',
    sandboxSub: 'Revisa cómo lucen botones, fotos y temas para el pasajero antes de publicar.',
    sandboxLaunchFullscreen: 'Abrir Pantalla Completa Aquí →',
  },
  fr: {
    pinSecured: 'Sécurisé PIN-4',
    backToKiosk: 'Portail Passager',
    publicPortal: 'Portail Public',
    adminTitle: 'Centre de Contrôle Silvermyst',
    adminSub: 'Administration à Distance de Flotte & Contenu',
    adminLangLabel: 'Langue Admin',
    passengerLangLabel: 'Langue Passager',
    activeProfile: 'Profil Actif',
    clearRequest: 'EFFACER DEMANDES',
    signOut: 'Déconnexion',
    daylightMode: 'Mode Jour',
    nightMode: 'Mode Nuit',
    soundEnabled: 'Sons Activés',
    soundMuted: 'Sons Coupés',
    saveChanges: 'Enregistrer',
    cancel: 'Annuler',
    deleteBtn: 'Supprimer',
    editBtn: 'Modifier',
    addBtn: 'Ajouter',
    showBtn: 'Afficher',
    hideBtn: 'Masquer',
    acknowledge: 'Confirmer',
    handled: 'Traité',
    speakAloud: 'Lire à voix haute',

    overviewWelcome: 'Bon retour',
    fleetOperatingNormal: 'La flotte passagers Silvermyst Multiservices fonctionne normalement.',
    launchScreensaver: 'Lancer Écran de Veille',
    openSandbox: 'Ouvrir Simulateur',
    adminAppsTitle: 'Apps Android Rapides Chauffeur & Admin',
    adminAppsSub: 'Accès en 1 clic à vos applications personnelles (Spotify, YouTube, Maps, Waze) — personnalisable.',
    customizeAdminApps: 'Personnaliser Apps',
    addAdminApp: 'Ajouter App Android',
    resetDefaultApps: 'Réinitialiser',
    editAdminApp: 'Modifier App Admin',
    appNameLabel: 'Nom de l’App',
    appSubtitleLabel: 'Sous-titre',
    appEmojiLabel: 'Émoji / Badge',
    appPackageLabel: 'Nom du Paquet Android',
    appDeepLinkLabel: 'Lien Profond / Intent URI',
    appWebUrlLabel: 'URL Web de Secours',
    appColorLabel: 'Couleur du Bouton',
    tapToOpenApp: 'Appuyer pour Ouvrir',
    statActiveDrivers: 'Chauffeurs Actifs',
    statProfilesSuffix: 'Profils',
    statDriversDesc: 'Flotte & PINs Personnalisables',
    statPassengerReqs: 'Demandes Passagers',
    statPendingSuffix: 'En attente',
    statAllCompleted: 'Toutes demandes traitées',
    statImmediateAttn: 'Attention requise',
    statGalleries: 'Galeries Photos',
    statAlbumsSuffix: 'Albums',
    statPhotosOrganized: 'photos organisées',
    statQuickConnects: 'Connexions Rapides',
    statPortalsSuffix: 'Portails',
    statVisiblePassengers: 'visibles aux passagers',
    pushAnnouncementTitle: 'Diffuser une Annonce Passager',
    pushAnnouncementSub: 'Affichez un bandeau d’annonce en temps réel sur toutes les tablettes.',
    pushAnnouncementPlaceholder: 'ex. Bienvenue à bord ! Eau fraîche et câbles de recharge disponibles.',
    broadcastToTablets: 'Diffuser sur Tablettes',

    backupTitle: 'Sauvegardes de Configuration & Historique',
    backupSub: 'Créez des sauvegardes complètes, exportez vers votre appareil ou chargez un fichier externe.',
    backupScopeTitle: 'Portée de la Sauvegarde',
    scopeFull: 'Système Complet (Config + Historique)',
    scopeFullDesc: 'Profils, PINs, apps, thèmes, postes, demandes, analyses et journaux',
    scopeConfig: 'Configuration Uniquement',
    scopeConfigDesc: 'Chauffeurs, PINs, apps passager & admin, liens QR, galeries & thèmes',
    scopeHistory: 'Historique Uniquement',
    scopeHistoryDesc: 'Postes de travail, demandes de changement, avis & analyses',
    exportToDeviceBtn: 'Exporter vers le Stockage Appareil',
    saveCloudSnapshotBtn: 'Sauvegarder dans le Cloud',
    restoreCloudSnapshotBtn: 'Charger Dernière Sauvegarde Cloud',
    uploadExternalTitle: 'Importer & Charger une Sauvegarde Externe',
    uploadExternalSub: 'Sélectionnez un fichier .json exporté depuis votre tablette, téléphone ou ordinateur.',
    selectBackupFileBtn: 'Choisir un Fichier (.json)',
    dropBackupHint: 'ou glissez-déposez votre fichier de sauvegarde ici',
    previewLoadedBackup: 'Fichier Prêt à Charger',
    restoreConfigCheck: 'Restaurer Configuration (Profils, PINs, Apps, Thèmes)',
    restoreHistoryCheck: 'Restaurer Historique (Postes, Demandes, Avis, Analyses)',
    applyExternalBackupBtn: 'Charger & Appliquer',
    discardPreviewBtn: 'Annuler Aperçu',
    cloudVaultTitle: 'Coffre Cloud',
    lastCloudBackup: 'Dernière Sauvegarde Cloud',
    noCloudBackupYet: 'Aucune sauvegarde complète enregistrée.',
    includedSummaryTitle: 'Inventaire Actuel Prêt à Exporter',

    requestsTitle: 'Demandes Passagers en Direct',
    requestsSub: 'Flux en temps réel des demandes de musique et confort cabine.',
    clearResolved: 'Effacer Traitées',
    clearRequestsAll: 'TOUT EFFACER',
    cabinComfortTitle: 'Confort Cabine & Assistance',
    totalLabel: 'total',
    noCabinRequests: 'Aucune demande cabine pour le moment.',
    newRequestBadge: 'Nouvelle Demande',
    acknowledgedBadge: 'Confirmée',
    quickReplyLabel: 'Réponse Rapide :',
    jukeboxRequestsTitle: 'Demandes de Musique',
    noSongRequests: 'Aucune chanson en file.',
    acceptAndQueue: 'Accepter',
    markPlayed: 'Marquer Jouée',
    playedBadge: 'Jouée',

    driversTitle: 'Profils Chauffeurs & Équipe',
    driversSub: 'Ajoutez des profils avec PINs et photos personnalisées, modifiez et sauvegardez.',
    addAdditionalDriver: 'Ajouter un Chauffeur',
    profileBackupTitle: 'Sauvegarde & Restauration des Profils',
    profileBackupSub: 'Sauvegardez profils, photos et PINs dans le Cloud ou en JSON.',
    staffRolesHierarchy: 'Rôles & Hiérarchie du Personnel',
    allRolesFilter: 'Tous',
    editProfile: 'Modifier Profil',
    activeOnKiosk: 'Actif sur Kiosque',
    setAsActive: 'Activer',
    bioLabel: 'Bio :',

    appsManagerTitle: 'Gestionnaire d’Apps & Boutons',
    appsManagerSub: 'Ajoutez et organisez les applications et boutons visibles par les passagers.',
    restoreDefaults: 'Réinitialiser',
    addNewButton: 'Nouveau Bouton',

    quickConnectManagerTitle: 'Connexion Rapide & Paiements QR',
    quickConnectManagerSub: 'Gérez paiements, réseaux sociaux et codes QR.',
    addQuickConnect: 'Ajouter Lien QR',

    galleriesTitle: 'Galeries Photos & Albums',
    galleriesSub: 'Créez et organisez les albums photo affichés dans le véhicule.',
    addPhoto: 'Ajouter Photo',
    createNewAlbum: 'Créer Album',
    activeAlbums: 'Albums Actifs',
    allAlbums: 'Tous les Albums',
    photosIn: 'Photos dans',

    screensaverTitle: 'Écran de Veille & Publicité',
    screensaverSub: 'Diaporama automatique lorsque la tablette est inactive.',
    previewScreensaver: 'Aperçu',
    fleetTabletsTitle: 'Tablettes & Flotte',
    fleetTabletsSub: 'Surveillez et contrôlez les tablettes Samsung à distance.',
    triggerScreensaver: 'Activer Veille',
    pingTablet: 'Tester Tablette',
    inquiriesTitle: 'Demandes de Services',
    inquiriesSub: 'Suivez les réservations et demandes IT/web soumises à bord.',
    callClient: 'Appeler',
    teamChatTitle: 'Communication Interne Équipe',
    teamChatSub: 'Canal en direct entre chauffeurs, managers et administrateurs.',
    sendMessage: 'Envoyer',
    securityTitle: 'PIN de Sécurité par Profil',
    securitySub: 'Chaque profil possède son propre code PIN à 4 chiffres (0000 par défaut).',
    selectProfilePin: 'Sélectionner le Profil',
    activePinFor: 'PIN Actif pour',
    updatePinFor: 'Modifier le PIN pour',
    savePinToProfile: 'Enregistrer le PIN',
    finishedAdminTitle: 'Administration Terminée ?',
    finishedAdminSub: 'Déconnectez-vous pour effacer les demandes et revenir en plein écran.',
    lockAndSignOut: 'Verrouiller & Quitter',

    controllerTitle: 'Contrôleur d’Expérience Flotte',
    controllerSub: 'Synchronisez chauffeurs actifs et options sur toute la flotte.',
    shiftCalTitle: 'Calendrier des Postes & Rapports',
    shiftCalSub: 'Glissez les chauffeurs sur le calendrier, imprimez/envoyez et synchronisez Google Agenda.',
    analyticsTitle: 'Analyses & Rapports Imprimables',
    analyticsSub: 'Générez des rapports quotidiens, hebdomadaires ou mensuels.',
    generateReport: 'Générer Rapport',
    feedbackTitle: 'Avis & Commentaires Passagers',
    feedbackSub: 'Notes confidentielles et suggestions reçues à bord.',
    announcementsTitle: 'Annonces & Contenu Programmé',
    announcementsSub: 'Diffusez des messages instantanés ou programmés.',
    marketingTitle: 'Pop-Ups Marketing & Thèmes',
    marketingSub: 'Créez des offres spéciales et personnalisez les couleurs du kiosque.',
    checklistsTitle: 'Checklists de Prise de Poste',
    checklistsSub: 'Vérifiez tablette, Wi-Fi, eau, chargeurs et propreté chaque jour.',
    recoveryTitle: 'Récupération Kiosque & Santé Appareils',
    recoverySub: 'Forcez la synchronisation ou rechargez les tablettes à distance.',
    historyTitle: 'Historique & Restauration',
    historySub: 'Journal des modifications avec restauration en 1 clic.',
    translationsTitle: 'Gestionnaire de Traductions',
    translationsSub: 'Personnalisez les phrases affichées aux passagers.',
    sandboxTitle: 'Simulateur de Kiosque en Direct',
    sandboxSub: 'Prévisualisez l’affichage passager avant publication.',
    sandboxLaunchFullscreen: 'Plein Écran Ici →',
  },
  de: {
    pinSecured: '4-PIN Gesichert',
    backToKiosk: 'Fahrgast-Portal',
    publicPortal: 'Öffentliches Portal',
    adminTitle: 'Silvermyst Leitstelle',
    adminSub: 'Flottenverwaltung & Inhaltssteuerung',
    adminLangLabel: 'Admin-Sprache',
    passengerLangLabel: 'Fahrgast-Sprache',
    activeProfile: 'Aktives Profil',
    clearRequest: 'WÜNSCHE LÖSCHEN',
    signOut: 'Abmelden',
    daylightMode: 'Tag-Modus',
    nightMode: 'Nacht-Modus',
    soundEnabled: 'Signaltöne Aktiv',
    soundMuted: 'Stummgeschaltet',
    saveChanges: 'Speichern',
    cancel: 'Abbrechen',
    deleteBtn: 'Löschen',
    editBtn: 'Bearbeiten',
    addBtn: 'Hinzufügen',
    showBtn: 'Anzeigen',
    hideBtn: 'Ausblenden',
    acknowledge: 'Bestätigen',
    handled: 'Erledigt',
    speakAloud: 'Vorlesen',

    overviewWelcome: 'Willkommen zurück',
    fleetOperatingNormal: 'Die Silvermyst-Flotte arbeitet einwandfrei.',
    launchScreensaver: 'Schoner starten',
    openSandbox: 'Sandbox öffnen',
    adminAppsTitle: 'Fahrer & Admin Android Schnell-Apps',
    adminAppsSub: '1-Tipp Zugriff auf Fahrer-Apps (Spotify, YouTube, Maps, Waze) — frei anpassbar.',
    customizeAdminApps: 'Apps Anpassen',
    addAdminApp: 'Android App hinzufügen',
    resetDefaultApps: 'Standardwerte',
    editAdminApp: 'Admin App bearbeiten',
    appNameLabel: 'App-Name',
    appSubtitleLabel: 'Untertitel',
    appEmojiLabel: 'Emoji / Symbol',
    appPackageLabel: 'Android Paketname',
    appDeepLinkLabel: 'Deep Link / Intent URI',
    appWebUrlLabel: 'Web-Fallback-URL',
    appColorLabel: 'Schaltflächenfarbe',
    tapToOpenApp: 'Zum Öffnen tippen',
    statActiveDrivers: 'Aktive Fahrer',
    statProfilesSuffix: 'Profile',
    statDriversDesc: 'Anpassbare Flotte & PINs',
    statPassengerReqs: 'Fahrgastwünsche',
    statPendingSuffix: 'Offen',
    statAllCompleted: 'Alle Wünsche erledigt',
    statImmediateAttn: 'Sofortige Aufmerksamkeit nötig',
    statGalleries: 'Fotogalerien',
    statAlbumsSuffix: 'Alben',
    statPhotosOrganized: 'organisierte Fotos',
    statQuickConnects: 'Schnellverbindungen',
    statPortalsSuffix: 'Portale',
    statVisiblePassengers: 'für Fahrgäste sichtbar',
    pushAnnouncementTitle: 'Mitteilung an Fahrgäste senden',
    pushAnnouncementSub: 'Senden Sie ein Live-Banner direkt an alle Fahrgast-Tablets.',
    pushAnnouncementPlaceholder: 'z.B. Willkommen an Bord! Kaltes Wasser und Ladekabel stehen bereit.',
    broadcastToTablets: 'An Tablets senden',

    backupTitle: 'Konfigurations- & Verlaufs-Backups',
    backupSub: 'Erstellen Sie vollständige Backups, exportieren Sie auf das Gerät oder laden Sie externe Sicherungen.',
    backupScopeTitle: 'Backup-Umfang wählen',
    scopeFull: 'Gesamtsystem (Konfig + Verlauf)',
    scopeFullDesc: 'Alle Profile, PINs, Apps, Designs, Schichten, Wünsche & Analysen',
    scopeConfig: 'Nur Konfiguration',
    scopeConfigDesc: 'Fahrer, PINs, Apps, QR-Links, Galerien & Designs',
    scopeHistory: 'Nur Verlaufsdaten',
    scopeHistoryDesc: 'Schichten, Schichttausch, Fahrgastwünsche, Feedback & Analysen',
    exportToDeviceBtn: 'Exportieren & Auf Gerät Speichern',
    saveCloudSnapshotBtn: 'In Cloud-Tresor speichern',
    restoreCloudSnapshotBtn: 'Letztes Cloud-Backup laden',
    uploadExternalTitle: 'Externes Backup hochladen & laden',
    uploadExternalSub: 'Wählen Sie eine zuvor exportierte .json Backup-Datei vom Gerät.',
    selectBackupFileBtn: 'Backup-Datei wählen (.json)',
    dropBackupHint: 'oder Silvermyst Backup-Datei hier ablegen',
    previewLoadedBackup: 'Backup-Datei bereit zum Laden',
    restoreConfigCheck: 'Konfiguration wiederherstellen (Profile, PINs, Apps, Designs)',
    restoreHistoryCheck: 'Verlaufsdaten wiederherstellen (Schichten, Wünsche, Analysen)',
    applyExternalBackupBtn: 'Ausgewählte Daten laden',
    discardPreviewBtn: 'Vorschau abbrechen',
    cloudVaultTitle: 'Cloud-Backup Status',
    lastCloudBackup: 'Letztes Cloud-Backup',
    noCloudBackupYet: 'Noch kein vollständiges Cloud-Backup.',
    includedSummaryTitle: 'Aktueller Systembestand für Export',

    requestsTitle: 'Fahrgastwünsche in Echtzeit',
    requestsSub: 'Live-Stream von Musik- und Komfortwünschen vom 10-Zoll-Tablet.',
    clearResolved: 'Erledigte löschen',
    clearRequestsAll: 'ALLE LÖSCHEN',
    cabinComfortTitle: 'Kabinenkomfort & Hilfe',
    totalLabel: 'gesamt',
    noCabinRequests: 'Noch keine Kabinenwünsche.',
    newRequestBadge: 'Neuer Wunsch',
    acknowledgedBadge: 'Bestätigt',
    quickReplyLabel: 'Schnellantwort:',
    jukeboxRequestsTitle: 'Musikwünsche',
    noSongRequests: 'Keine Lieder in der Warteschlange.',
    acceptAndQueue: 'Akzeptieren',
    markPlayed: 'Als Gespielt markieren',
    playedBadge: 'Gespielt',

    driversTitle: 'Fahrerprofile & Flottenliste',
    driversSub: 'Unbegrenzte Profile mit eigenen PINs & Fotos verwalten und sichern.',
    addAdditionalDriver: 'Fahrer hinzufügen',
    profileBackupTitle: 'Profil-Backup & Wiederherstellung',
    profileBackupSub: 'Sichern Sie Fahrerprofile, Fotos und PINs in der Cloud oder als JSON.',
    staffRolesHierarchy: 'Personalrollen & Hierarchie',
    allRolesFilter: 'Alle',
    editProfile: 'Profil bearbeiten',
    activeOnKiosk: 'Auf Kiosk aktiv',
    setAsActive: 'Aktivieren',
    bioLabel: 'Info:',

    appsManagerTitle: 'Tablet-App & Button-Manager',
    appsManagerSub: 'Buttons hinzufügen, bearbeiten, neu anordnen und Sichtbarkeit steuern.',
    restoreDefaults: 'Standardwerte',
    addNewButton: 'Neuer Button',

    quickConnectManagerTitle: 'QR & Schnellkontakt-Manager',
    quickConnectManagerSub: 'Zahlungslinks, soziale Netzwerke und QR-Karten verwalten.',
    addQuickConnect: 'QR-Link hinzufügen',

    galleriesTitle: 'Fotogalerien & Alben',
    galleriesSub: 'Alben erstellen, sortieren und Kabinenfotos verwalten.',
    addPhoto: 'Foto hinzufügen',
    createNewAlbum: 'Album erstellen',
    activeAlbums: 'Aktive Alben',
    allAlbums: 'Alle Alben',
    photosIn: 'Fotos in',

    screensaverTitle: 'Bildschirmschoner & Werbung',
    screensaverSub: 'Vollbild-Diashow bei Inaktivität des Fahrgast-Tablets.',
    previewScreensaver: 'Vorschau',
    fleetTabletsTitle: 'Fahrgast-Tablets & Flotte',
    fleetTabletsSub: 'Samsung 10-Zoll-Tablets im Fahrzeug fernüberwachen.',
    triggerScreensaver: 'Schoner starten',
    pingTablet: 'Tablet testen',
    inquiriesTitle: 'Service-Anfragen',
    inquiriesSub: 'Direkte Buchungs- und Service-Anfragen verfolgen.',
    callClient: 'Anrufen',
    teamChatTitle: 'Interne Team-Kommunikation',
    teamChatSub: 'Echtzeit-Kanal für Fahrer, Manager und Administratoren.',
    sendMessage: 'Senden',
    securityTitle: 'Profil-spezifische Sicherheits-PIN',
    securitySub: 'Jedes Profil hat eine eigene 4-stellige PIN (Standard 0000).',
    selectProfilePin: 'Profil auswählen',
    activePinFor: 'Aktive PIN für',
    updatePinFor: 'PIN aktualisieren für',
    savePinToProfile: 'PIN speichern',
    finishedAdminTitle: 'Verwaltung abgeschlossen?',
    finishedAdminSub: 'Abmelden, um Wünsche zu löschen und den Kiosk zu sperren.',
    lockAndSignOut: 'Sperren & Abmelden',

    controllerTitle: 'Flotten- & Erlebnis-Controller',
    controllerSub: 'Fahrer, Sichtbarkeit und Tablet-Aktionen flottenweit steuern.',
    shiftCalTitle: 'Schichtkalender & Berichte',
    shiftCalSub: 'Fahrer per Drag & Drop planen, drucken/mailen/SMS & Google Kalender synchronisieren.',
    analyticsTitle: 'Nutzungsanalysen & Druckberichte',
    analyticsSub: 'Tages-, Wochen- und Monatsberichte erstellen und exportieren.',
    generateReport: 'Bericht erstellen',
    feedbackTitle: 'Fahrgast-Bewertungen & Feedback',
    feedbackSub: 'Vertrauliche Bewertungen und Anregungen aus dem Fahrzeug.',
    announcementsTitle: 'Fern-Mitteilungen & Zeitplan',
    announcementsSub: 'Live-Banner senden oder geplante Nachrichten festlegen.',
    marketingTitle: 'Marketing-Pop-Ups & Farbthemen',
    marketingSub: 'Feiertags- oder Event-Pop-Ups und Kabinenfarben verwalten.',
    checklistsTitle: 'Schicht-Checklisten',
    checklistsSub: 'Tablet, WLAN, Wasser, Ladekabel und Sauberkeit täglich prüfen.',
    recoveryTitle: 'Kiosk-Wiederherstellung & Zustand',
    recoverySub: 'Verbindung prüfen, Synchronisierung erzwingen oder Cache leeren.',
    historyTitle: 'Änderungsverlauf & Rollback',
    historySub: 'Änderungsprotokoll mit 1-Klick-Wiederherstellung.',
    translationsTitle: 'Übersetzungs-Manager',
    translationsSub: 'Zweisprachige Fahrgasttexte anpassen und veröffentlichen.',
    sandboxTitle: 'Live Kiosk-Sandbox',
    sandboxSub: 'Vorschau der Fahrgastansicht vor der Veröffentlichung.',
    sandboxLaunchFullscreen: 'Vollbild hier starten →',
  },
};

export function getAdminTranslations(lang?: SupportedLanguage): AdminTranslationStrings {
  return ADMIN_TRANSLATIONS[lang || 'en'] || ADMIN_TRANSLATIONS.en;
}

export interface AdminSubLabels {
  all: string;
  device: string;
  allTablets: string;
  forceResync: string;
  syncing: string;
  appliedOnTablets: string;
  activeDriverProfile: string;
  liveKioskProfile: string;
  pushFleetAnnouncement: string;
  broadcast: string;
  predefinedTemplates: string;
  appFeatureToggles: string;
  quickConnectDockItems: string;
  overallRating: string;
  totalSubmissions: string;
  fiveStarRides: string;
  complimentsTagged: string;
  filterStars: string;
  category: string;
  allFeedback: string;
  complimentsOnly: string;
  suggestions: string;
  concerns: string;
  submissionLog: string;
  reviewsShown: string;
  scheduleBroadcast: string;
  closeForm: string;
  broadcastNow: string;
  targetTablet: string;
  bannerPriority: string;
  announcementText: string;
  dispatch: string;
  saveSchedule: string;
  activeScheduledCal: string;
  allStaff: string;
  printEmailText: string;
  syncGoogleCal: string;
  addShift: string;
  today: string;
  fleetRoster: string;
  dragRosterHint: string;
  hours: string;
  selectedDate: string;
  swapChange: string;
  swapInboxTitle: string;
  approve: string;
  decline: string;
  scheduleShiftTitle: string;
  editShiftTitle: string;
  saveShiftBtn: string;
  print: string;
  emailReport: string;
  textSms: string;
  copyText: string;
  confirmGCalSync: string;
  confirmAndSync: string;
  requestSwapTitle: string;
  sendRequest: string;
  weekdays: string[];
  driverLabel: string;
  readinessScore: string;
  saveSignOff: string;
  todaysInspection: string;
  addItem: string;
  readinessHistory: string;
  last24Hours: string;
  thisWeek: string;
  thisMonth: string;
  allHistory: string;
  totalInteractions: string;
  songRequests: string;
  comfortAndChat: string;
  scheduledShifts: string;
  ratingScore: string;
  runAnalyticalReports: string;
  exportCsv: string;
  reportType: string;
  timeframe: string;
  driverScope: string;
  mostTappedApps: string;
  atmospherePrefs: string;
  screenResolution: string;
  appVersion: string;
  remoteRecoveryProc: string;
  executeResync: string;
  executeReload: string;
  soundChimeNow: string;
  wipeLocalCache: string;
  historicalSnapshots: string;
  restoreThisVersion: string;
  publishToFleet: string;
  publishing: string;
  allPhrases: string;
  navTabsCat: string;
  appButtonsCat: string;
  passengerReqsCat: string;
  announcementsCat: string;
  activePhraseDict: string;
  cabinThemesHeading: string;
  marketingPopupsHeading: string;
  createMarketingPopup: string;
  activeStatus: string;
  pausedStatus: string;
  showNow: string;
  pauseBtn: string;
  activateBtn: string;
  fullBackupShortcut: string;
  cloudBackup: string;
  restoreCloud: string;
  exportJson: string;
  importJson: string;
}

export const ADMIN_SUB_LABELS: Record<SupportedLanguage, AdminSubLabels> = {
  en: {
    all: 'All',
    device: 'Device',
    allTablets: 'All Fleet Tablets',
    forceResync: 'Force Resync',
    syncing: 'Syncing...',
    appliedOnTablets: 'Applied on Tablets',
    activeDriverProfile: 'Active Driver Profile',
    liveKioskProfile: 'Live Kiosk Profile',
    pushFleetAnnouncement: 'Push Fleet Announcement',
    broadcast: 'Broadcast',
    predefinedTemplates: '1-Tap Predefined Templates:',
    appFeatureToggles: 'Passenger App & Feature Toggles',
    quickConnectDockItems: 'Quick Connect & Payment Dock Items',
    overallRating: 'Overall Rating',
    totalSubmissions: 'Total Submissions',
    fiveStarRides: '5-Star Rides',
    complimentsTagged: 'Compliments Tagged',
    filterStars: 'Filter Stars:',
    category: 'Category:',
    allFeedback: 'All Feedback',
    complimentsOnly: 'Compliments Only',
    suggestions: 'Suggestions',
    concerns: 'Concerns / Issues',
    submissionLog: 'Passenger Submission Log',
    reviewsShown: 'Reviews Shown',
    scheduleBroadcast: 'Schedule Future Broadcast',
    closeForm: 'Close Form',
    broadcastNow: 'Broadcast Instant Announcement Now',
    targetTablet: 'Target Tablet',
    bannerPriority: 'Banner Style / Priority',
    announcementText: 'Announcement Text *',
    dispatch: 'Dispatch',
    saveSchedule: 'Save Schedule',
    activeScheduledCal: 'Active Scheduled Content Calendar',
    allStaff: 'All Staff',
    printEmailText: 'Print / Email / Text',
    syncGoogleCal: 'Sync Google Calendar',
    addShift: 'Add Shift',
    today: 'Today',
    fleetRoster: 'Fleet Roster',
    dragRosterHint: 'Drag any person onto a calendar box to schedule',
    hours: 'Hours',
    selectedDate: 'Selected Date',
    swapChange: 'Swap / Change',
    swapInboxTitle: 'Shift Swap & Change Requests',
    approve: 'Approve',
    decline: 'Decline',
    scheduleShiftTitle: 'Schedule Driver Working Shift',
    editShiftTitle: 'Edit Scheduled Shift',
    saveShiftBtn: 'Save Shift to Calendar',
    print: 'Print',
    emailReport: 'Email Report',
    textSms: 'Text / SMS',
    copyText: 'Copy Text',
    confirmGCalSync: 'Confirm Google Calendar Sync',
    confirmAndSync: 'Confirm & Sync Now',
    requestSwapTitle: 'Request Shift Change / Swap',
    sendRequest: 'Send Request',
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    driverLabel: 'Driver:',
    readinessScore: 'Shift Readiness Score:',
    saveSignOff: 'Save & Sign Off Shift Checklist',
    todaysInspection: "Today's Inspection Items",
    addItem: 'Add Item',
    readinessHistory: 'Shift Readiness History',
    last24Hours: 'Last 24 Hours',
    thisWeek: 'This Week (7 Days)',
    thisMonth: 'This Month (30 Days)',
    allHistory: 'All Recorded History',
    totalInteractions: 'Total Interactions',
    songRequests: 'Song Requests',
    comfortAndChat: 'Comfort & Chat',
    scheduledShifts: 'Scheduled Shifts',
    ratingScore: 'Rating Score',
    runAnalyticalReports: 'Run Analytical Fleet Reports',
    exportCsv: 'Export CSV',
    reportType: 'Report Type',
    timeframe: 'Timeframe',
    driverScope: 'Driver Scope',
    mostTappedApps: 'Most Tapped Kiosk Apps',
    atmospherePrefs: 'Passenger Atmosphere Preferences',
    screenResolution: 'Screen Resolution',
    appVersion: 'App Version',
    remoteRecoveryProc: 'Remote Recovery Procedures',
    executeResync: 'Execute Cloud Resync',
    executeReload: 'Execute Remote Reload',
    soundChimeNow: 'Sound Chime Now',
    wipeLocalCache: 'Wipe Local Cache',
    historicalSnapshots: 'Historical Version Snapshots',
    restoreThisVersion: 'Restore This Version',
    publishToFleet: 'Publish to Fleet',
    publishing: 'Publishing...',
    allPhrases: 'All Phrases',
    navTabsCat: 'Navigation Tabs',
    appButtonsCat: 'App Buttons',
    passengerReqsCat: 'Passenger Requests',
    announcementsCat: 'Announcements',
    activePhraseDict: 'Active Phrase Dictionary',
    cabinThemesHeading: 'Cabin Color Themes & Holiday / Game Day Backgrounds',
    marketingPopupsHeading: 'Holiday, Event & Marketing Pop-Ups',
    createMarketingPopup: 'Create Marketing Pop-Up',
    activeStatus: 'Active',
    pausedStatus: 'Paused',
    showNow: 'Show Now',
    pauseBtn: 'Pause',
    activateBtn: 'Activate',
    fullBackupShortcut: 'Full Config & History Backup Center',
    cloudBackup: 'Cloud Backup',
    restoreCloud: 'Restore Cloud',
    exportJson: 'Export JSON',
    importJson: 'Import JSON',
  },
  es: {
    all: 'Todos',
    device: 'Dispositivo',
    allTablets: 'Todas las Tablets de Flota',
    forceResync: 'Forzar Sincronización',
    syncing: 'Sincronizando...',
    appliedOnTablets: 'Aplicado en Tablets',
    activeDriverProfile: 'Perfil de Chofer Activo',
    liveKioskProfile: 'Perfil en Vivo',
    pushFleetAnnouncement: 'Enviar Anuncio de Flota',
    broadcast: 'Transmitir',
    predefinedTemplates: 'Plantillas Rápidas en 1 Toque:',
    appFeatureToggles: 'Controles de Apps y Funciones del Pasajero',
    quickConnectDockItems: 'Elementos de Conexión Rápida y Pagos QR',
    overallRating: 'Calificación General',
    totalSubmissions: 'Total de Reseñas',
    fiveStarRides: 'Viajes de 5 Estrellas',
    complimentsTagged: 'Elogios Recibidos',
    filterStars: 'Filtrar Estrellas:',
    category: 'Categoría:',
    allFeedback: 'Todas las Reseñas',
    complimentsOnly: 'Solo Elogios',
    suggestions: 'Sugerencias',
    concerns: 'Inquietudes',
    submissionLog: 'Registro de Opiniones de Pasajeros',
    reviewsShown: 'Reseñas Mostradas',
    scheduleBroadcast: 'Programar Anuncio Futuro',
    closeForm: 'Cerrar Formulario',
    broadcastNow: 'Transmitir Anuncio Instantáneo Ahora',
    targetTablet: 'Tablet Destino',
    bannerPriority: 'Estilo / Prioridad del Banner',
    announcementText: 'Texto del Anuncio *',
    dispatch: 'Enviar',
    saveSchedule: 'Guardar Programación',
    activeScheduledCal: 'Calendario de Contenido Programado',
    allStaff: 'Todo el Personal',
    printEmailText: 'Imprimir / Correo / SMS',
    syncGoogleCal: 'Sincronizar Google Calendar',
    addShift: 'Agregar Turno',
    today: 'Hoy',
    fleetRoster: 'Lista de Personal',
    dragRosterHint: 'Arrastra cualquier persona a un día del calendario para programar',
    hours: 'Horas',
    selectedDate: 'Fecha Seleccionada',
    swapChange: 'Cambiar / Cubrir',
    swapInboxTitle: 'Solicitudes de Cambio y Cobertura',
    approve: 'Aprobar',
    decline: 'Rechazar',
    scheduleShiftTitle: 'Programar Turno de Trabajo',
    editShiftTitle: 'Editar Turno Programado',
    saveShiftBtn: 'Guardar Turno en Calendario',
    print: 'Imprimir',
    emailReport: 'Enviar por Correo',
    textSms: 'Enviar por SMS',
    copyText: 'Copiar Texto',
    confirmGCalSync: 'Confirmar Sincronización Google Calendar',
    confirmAndSync: 'Confirmar y Sincronizar',
    requestSwapTitle: 'Solicitar Cambio / Cobertura de Turno',
    sendRequest: 'Enviar Solicitud',
    weekdays: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    driverLabel: 'Chofer:',
    readinessScore: 'Puntaje de Revisión de Turno:',
    saveSignOff: 'Guardar y Firmar Lista de Turno',
    todaysInspection: 'Puntos de Inspección de Hoy',
    addItem: 'Agregar Punto',
    readinessHistory: 'Historial de Revisiones de Turno',
    last24Hours: 'Últimas 24 Horas',
    thisWeek: 'Esta Semana (7 Días)',
    thisMonth: 'Este Mes (30 Días)',
    allHistory: 'Todo el Historial',
    totalInteractions: 'Interacciones Totales',
    songRequests: 'Peticiones de Música',
    comfortAndChat: 'Comodidad y Chat',
    scheduledShifts: 'Turnos Programados',
    ratingScore: 'Calificación',
    runAnalyticalReports: 'Generar Reportes Analíticos de Flota',
    exportCsv: 'Exportar CSV',
    reportType: 'Tipo de Reporte',
    timeframe: 'Periodo',
    driverScope: 'Filtro de Chofer',
    mostTappedApps: 'Apps Más Usadas en Cabina',
    atmospherePrefs: 'Preferencias de Ambiente del Pasajero',
    screenResolution: 'Resolución de Pantalla',
    appVersion: 'Versión de App',
    remoteRecoveryProc: 'Procedimientos de Recuperación Remota',
    executeResync: 'Ejecutar Resincronización Nube',
    executeReload: 'Recargar Pantalla Remota',
    soundChimeNow: 'Probar Sonido Ahora',
    wipeLocalCache: 'Limpiar Caché Local',
    historicalSnapshots: 'Instantáneas Históricas',
    restoreThisVersion: 'Restaurar Esta Versión',
    publishToFleet: 'Publicar en Flota',
    publishing: 'Publicando...',
    allPhrases: 'Todas las Frases',
    navTabsCat: 'Pestañas de Navegación',
    appButtonsCat: 'Botones de Apps',
    passengerReqsCat: 'Peticiones de Pasajero',
    announcementsCat: 'Anuncios',
    activePhraseDict: 'Diccionario Activo de Frases',
    cabinThemesHeading: 'Temas de Color y Fondos Festivos / Deportivos',
    marketingPopupsHeading: 'Pop-Ups Festivos, de Eventos y Marketing',
    createMarketingPopup: 'Crear Pop-Up Promocional',
    activeStatus: 'Activo',
    pausedStatus: 'Pausado',
    showNow: 'Mostrar Ahora',
    pauseBtn: 'Pausar',
    activateBtn: 'Activar',
    fullBackupShortcut: 'Centro Completo de Respaldos',
    cloudBackup: 'Respaldo Nube',
    restoreCloud: 'Restaurar Nube',
    exportJson: 'Exportar JSON',
    importJson: 'Importar JSON',
  },
  fr: {
    all: 'Tous',
    device: 'Appareil',
    allTablets: 'Toutes les Tablettes',
    forceResync: 'Forcer Sync',
    syncing: 'Synchronisation...',
    appliedOnTablets: 'Appliqué sur Tablettes',
    activeDriverProfile: 'Profil Chauffeur Actif',
    liveKioskProfile: 'Profil en Direct',
    pushFleetAnnouncement: 'Diffuser Annonce Flotte',
    broadcast: 'Diffuser',
    predefinedTemplates: 'Modèles Rapides 1-Clic :',
    appFeatureToggles: 'Contrôles des Apps Passager',
    quickConnectDockItems: 'Liens Rapides & Paiements QR',
    overallRating: 'Note Globale',
    totalSubmissions: 'Total des Avis',
    fiveStarRides: 'Trajets 5 Étoiles',
    complimentsTagged: 'Compliments Reçus',
    filterStars: 'Filtrer Étoiles :',
    category: 'Catégorie :',
    allFeedback: 'Tous les Avis',
    complimentsOnly: 'Compliments Uniquement',
    suggestions: 'Suggestions',
    concerns: 'Préoccupations',
    submissionLog: 'Journal des Avis Passagers',
    reviewsShown: 'Avis Affichés',
    scheduleBroadcast: 'Programmer une Diffusion',
    closeForm: 'Fermer',
    broadcastNow: 'Diffuser un Message Maintenant',
    targetTablet: 'Tablette Cible',
    bannerPriority: 'Style / Priorité',
    announcementText: 'Texte de l’Annonce *',
    dispatch: 'Envoyer',
    saveSchedule: 'Enregistrer',
    activeScheduledCal: 'Calendrier des Diffusions Programmées',
    allStaff: 'Tout le Personnel',
    printEmailText: 'Imprimer / E-mail / SMS',
    syncGoogleCal: 'Sync Google Agenda',
    addShift: 'Ajouter Poste',
    today: 'Aujourd’hui',
    fleetRoster: 'Équipe Flotte',
    dragRosterHint: 'Glissez une personne sur une date pour planifier',
    hours: 'Heures',
    selectedDate: 'Date Sélectionnée',
    swapChange: 'Échanger / Modifier',
    swapInboxTitle: 'Demandes de Changement de Poste',
    approve: 'Approuver',
    decline: 'Refuser',
    scheduleShiftTitle: 'Planifier un Poste de Travail',
    editShiftTitle: 'Modifier le Poste',
    saveShiftBtn: 'Enregistrer dans le Calendrier',
    print: 'Imprimer',
    emailReport: 'Envoyer par E-mail',
    textSms: 'Envoyer par SMS',
    copyText: 'Copier Texte',
    confirmGCalSync: 'Confirmer Synchro Google Agenda',
    confirmAndSync: 'Confirmer & Synchroniser',
    requestSwapTitle: 'Demander Échange / Couverture',
    sendRequest: 'Envoyer Demande',
    weekdays: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    driverLabel: 'Chauffeur :',
    readinessScore: 'Score de Préparation :',
    saveSignOff: 'Valider la Checklist',
    todaysInspection: 'Points de Contrôle du Jour',
    addItem: 'Ajouter',
    readinessHistory: 'Historique des Checklists',
    last24Hours: 'Dernières 24h',
    thisWeek: 'Cette Semaine (7j)',
    thisMonth: 'Ce Mois (30j)',
    allHistory: 'Tout l’Historique',
    totalInteractions: 'Interactions Totales',
    songRequests: 'Demandes Musicales',
    comfortAndChat: 'Confort & Chat',
    scheduledShifts: 'Postes Planifiés',
    ratingScore: 'Note Moyenne',
    runAnalyticalReports: 'Rapports Analytiques de Flotte',
    exportCsv: 'Exporter CSV',
    reportType: 'Type de Rapport',
    timeframe: 'Période',
    driverScope: 'Chauffeur',
    mostTappedApps: 'Apps les Plus Utilisées',
    atmospherePrefs: 'Préférences d’Ambiance',
    screenResolution: 'Résolution Écran',
    appVersion: 'Version App',
    remoteRecoveryProc: 'Procédures de Récupération',
    executeResync: 'Exécuter Resync Cloud',
    executeReload: 'Recharger l’Écran',
    soundChimeNow: 'Tester Carillon',
    wipeLocalCache: 'Vider le Cache Local',
    historicalSnapshots: 'Instantanés Historiques',
    restoreThisVersion: 'Restaurer Cette Version',
    publishToFleet: 'Publier sur la Flotte',
    publishing: 'Publication...',
    allPhrases: 'Toutes les Phrases',
    navTabsCat: 'Onglets de Navigation',
    appButtonsCat: 'Boutons Apps',
    passengerReqsCat: 'Demandes Passagers',
    announcementsCat: 'Annonces',
    activePhraseDict: 'Dictionnaire des Phrases',
    cabinThemesHeading: 'Thèmes Couleur & Fonds Événements',
    marketingPopupsHeading: 'Pop-Ups Marketing & Fêtes',
    createMarketingPopup: 'Créer un Pop-Up',
    activeStatus: 'Actif',
    pausedStatus: 'En Pause',
    showNow: 'Afficher',
    pauseBtn: 'Pause',
    activateBtn: 'Activer',
    fullBackupShortcut: 'Centre Complet de Sauvegarde',
    cloudBackup: 'Sauvegarde Cloud',
    restoreCloud: 'Restaurer Cloud',
    exportJson: 'Exporter JSON',
    importJson: 'Importer JSON',
  },
  de: {
    all: 'Alle',
    device: 'Gerät',
    allTablets: 'Alle Flotten-Tablets',
    forceResync: 'Sync erzwingen',
    syncing: 'Synchronisiere...',
    appliedOnTablets: 'Auf Tablets aktiv',
    activeDriverProfile: 'Aktives Fahrerprofil',
    liveKioskProfile: 'Live-Profil',
    pushFleetAnnouncement: 'Flotten-Mitteilung senden',
    broadcast: 'Senden',
    predefinedTemplates: '1-Tipp Vorlagen:',
    appFeatureToggles: 'Fahrgast-App & Funktionsschalter',
    quickConnectDockItems: 'Schnellzugriff & QR-Zahlungen',
    overallRating: 'Gesamtbewertung',
    totalSubmissions: 'Einsendungen',
    fiveStarRides: '5-Sterne-Fahrten',
    complimentsTagged: 'Komplimente',
    filterStars: 'Sterne filtern:',
    category: 'Kategorie:',
    allFeedback: 'Alle Bewertungen',
    complimentsOnly: 'Nur Komplimente',
    suggestions: 'Vorschläge',
    concerns: 'Hinweise',
    submissionLog: 'Fahrgast-Feedback Protokoll',
    reviewsShown: 'Angezeigt',
    scheduleBroadcast: 'Zukünftige Sendung planen',
    closeForm: 'Schließen',
    broadcastNow: 'Sofortige Mitteilung senden',
    targetTablet: 'Ziel-Tablet',
    bannerPriority: 'Banner-Stil / Priorität',
    announcementText: 'Mitteilungstext *',
    dispatch: 'Senden',
    saveSchedule: 'Zeitplan speichern',
    activeScheduledCal: 'Geplanter Inhaltskalender',
    allStaff: 'Gesamtes Team',
    printEmailText: 'Drucken / E-Mail / SMS',
    syncGoogleCal: 'Google Kalender Sync',
    addShift: 'Schicht hinzu',
    today: 'Heute',
    fleetRoster: 'Flotten-Team',
    dragRosterHint: 'Person auf ein Datum ziehen zum Planen',
    hours: 'Stunden',
    selectedDate: 'Gewähltes Datum',
    swapChange: 'Tauschen / Ändern',
    swapInboxTitle: 'Schichttausch & Änderungsanfragen',
    approve: 'Genehmigen',
    decline: 'Ablehnen',
    scheduleShiftTitle: 'Arbeitsschicht planen',
    editShiftTitle: 'Schicht bearbeiten',
    saveShiftBtn: 'Schicht speichern',
    print: 'Drucken',
    emailReport: 'Per E-Mail',
    textSms: 'Per SMS',
    copyText: 'Text kopieren',
    confirmGCalSync: 'Google Kalender Sync bestätigen',
    confirmAndSync: 'Bestätigen & Sync',
    requestSwapTitle: 'Schichttausch anfragen',
    sendRequest: 'Anfrage senden',
    weekdays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    driverLabel: 'Fahrer:',
    readinessScore: 'Schicht-Bereitschaft:',
    saveSignOff: 'Checklist speichern & abzeichnen',
    todaysInspection: 'Heutige Prüfpunkte',
    addItem: 'Hinzufügen',
    readinessHistory: 'Prüfungsverlauf',
    last24Hours: 'Letzte 24 Std.',
    thisWeek: 'Diese Woche (7T)',
    thisMonth: 'Dieser Monat (30T)',
    allHistory: 'Gesamter Verlauf',
    totalInteractions: 'Interaktionen',
    songRequests: 'Musikwünsche',
    comfortAndChat: 'Komfort & Chat',
    scheduledShifts: 'Geplante Schichten',
    ratingScore: 'Bewertung',
    runAnalyticalReports: 'Analytische Flottenberichte',
    exportCsv: 'CSV exportieren',
    reportType: 'Berichtstyp',
    timeframe: 'Zeitraum',
    driverScope: 'Fahrerfilter',
    mostTappedApps: 'Beliebteste Kiosk-Apps',
    atmospherePrefs: 'Kabinen-Präferenzen',
    screenResolution: 'Auflösung',
    appVersion: 'App-Version',
    remoteRecoveryProc: 'Fern-Wiederherstellung',
    executeResync: 'Cloud-Sync ausführen',
    executeReload: 'Anzeige neu laden',
    soundChimeNow: 'Signalton testen',
    wipeLocalCache: 'Lokalen Cache leeren',
    historicalSnapshots: 'Verlaufs-Schnappschüsse',
    restoreThisVersion: 'Diese Version wiederherstellen',
    publishToFleet: 'An Flotte veröffentlichen',
    publishing: 'Veröffentliche...',
    allPhrases: 'Alle Texte',
    navTabsCat: 'Navigation',
    appButtonsCat: 'App-Buttons',
    passengerReqsCat: 'Fahrgastwünsche',
    announcementsCat: 'Mitteilungen',
    activePhraseDict: 'Aktives Wörterbuch',
    cabinThemesHeading: 'Farbthemen & Event-Hintergründe',
    marketingPopupsHeading: 'Feiertags- & Marketing-Pop-Ups',
    createMarketingPopup: 'Pop-Up erstellen',
    activeStatus: 'Aktiv',
    pausedStatus: 'Pausiert',
    showNow: 'Jetzt zeigen',
    pauseBtn: 'Pausieren',
    activateBtn: 'Aktivieren',
    fullBackupShortcut: 'Vollständiges Backup-Center',
    cloudBackup: 'Cloud-Backup',
    restoreCloud: 'Cloud laden',
    exportJson: 'JSON exportieren',
    importJson: 'JSON importieren',
  },
};

export function getAdminSubLabels(lang?: SupportedLanguage): AdminSubLabels {
  return ADMIN_SUB_LABELS[lang || 'en'] || ADMIN_SUB_LABELS.en;
}

