import { getDb } from './db';

export function seedDatabase() {
  const db = getDb();

  // Clear existing data cleanly
  db.exec(`
    DELETE FROM audit_events;
    DELETE FROM notifications;
    DELETE FROM disruptions;
    DELETE FROM condition_reports;
    DELETE FROM maintenance_records;
    DELETE FROM waitlist;
    DELETE FROM bookings;
    DELETE FROM resource_skills;
    DELETE FROM user_skills;
    DELETE FROM skills;
    DELETE FROM resources;
    DELETE FROM users;
  `);

  const now = new Date();
  const formatISO = (d: Date) => d.toISOString();

  // 1. Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, name, role, department, institution, avatar, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    'user-dev',
    'dev.patel@iit.ac.in',
    'Dev Patel',
    'user',
    'Department of Robotics & Automation',
    'IIT Bombay',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    new Date(Date.now() - 60 * 86400000).toISOString()
  );

  insertUser.run(
    'user-owner-aris',
    'dr.aris.vance@iit.ac.in',
    'Dr. Aris Vance',
    'owner',
    'Advanced Additive & Digital Fabrication Center',
    'IIT Bombay',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    new Date(Date.now() - 120 * 86400000).toISOString()
  );

  insertUser.run(
    'user-owner-elena',
    'prof.elena.rostova@iit.ac.in',
    'Prof. Elena Rostova',
    'owner',
    'Center for Nano Science & Quantum Devices',
    'IIT Bombay',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    new Date(Date.now() - 150 * 86400000).toISOString()
  );

  insertUser.run(
    'user-admin-raman',
    'dean.raman@iit.ac.in',
    'Dean S. Raman',
    'admin',
    'Office of Research Infrastructure & Oversight',
    'IIT Bombay',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    new Date(Date.now() - 200 * 86400000).toISOString()
  );

  insertUser.run(
    'user-anya',
    'anya.sharma@iit.ac.in',
    'Anya Sharma',
    'user',
    'Department of Biomedical Engineering',
    'IIT Bombay',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    new Date(Date.now() - 45 * 86400000).toISOString()
  );

  insertUser.run(
    'user-kabir',
    'kabir.mehta@iit.ac.in',
    'Kabir Mehta',
    'user',
    'Department of Aerospace Engineering',
    'IIT Bombay',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    new Date(Date.now() - 20 * 86400000).toISOString()
  );

  // 2. Skills
  const insertSkill = db.prepare(`
    INSERT INTO skills (id, name, category, description)
    VALUES (?, ?, ?, ?)
  `);

  insertSkill.run('skill-fdm', 'Stratasys FDM Industrial Operator', 'Fabrication', 'Certified to operate high-temp industrial thermoplastic extrusion printers.');
  insertSkill.run('skill-laser', 'Laser Safety Level 2', 'Lab Safety', 'Verification of high-energy collimated beam safety and protective shielding protocols.');
  insertSkill.run('skill-cleanroom', 'Cleanroom Class 1000 Protocol', 'Nanofab', 'Gowning, particle containment, and contamination control certification.');
  insertSkill.run('skill-sem', 'Electron Microscopy (FE-SEM) Certified', 'Metrology', 'Vacuum chamber pumpdown, electron beam filament alignment, and EDX calibration.');
  insertSkill.run('skill-hpc', 'Slurm HPC Clearance Tier 1', 'Compute', 'Multi-node GPU allocation scripting and memory pinning authorization.');

  // 3. User Skills (SkillGate certifications)
  const insertUserSkill = db.prepare(`
    INSERT INTO user_skills (id, user_id, skill_id, status, certificate_ref, verified_at, verified_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertUserSkill.run('usk-1', 'user-dev', 'skill-fdm', 'verified', 'CERT-IITB-AM-2026-081', new Date(Date.now() - 30 * 86400000).toISOString(), 'user-owner-aris');
  insertUserSkill.run('usk-2', 'user-dev', 'skill-laser', 'verified', 'CERT-IITB-LS-2025-412', new Date(Date.now() - 60 * 86400000).toISOString(), 'user-admin-raman');
  insertUserSkill.run('usk-3', 'user-anya', 'skill-cleanroom', 'verified', 'CERT-IITB-CR-2026-104', new Date(Date.now() - 15 * 86400000).toISOString(), 'user-owner-elena');
  insertUserSkill.run('usk-4', 'user-anya', 'skill-fdm', 'verified', 'CERT-IITB-AM-2026-095', new Date(Date.now() - 10 * 86400000).toISOString(), 'user-owner-aris');
  insertUserSkill.run('usk-5', 'user-kabir', 'skill-sem', 'pending', 'SUBM-IITB-SEM-PENDING', null, null);

  // 4. Resources
  const insertResource = db.prepare(`
    INSERT INTO resources (
      id, title, slug, category, subcategory, description, specifications,
      location, building, room, hourly_rate, deposit, turnaround_buffer_mins,
      owner_id, status, condition_rating, serial_number, passport_id, image_url, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Res 1: Stratasys 450mc
  insertResource.run(
    'res-stratasys-450mc',
    'Stratasys Fortus 450mc Production 3D Printer',
    'stratasys-fortus-450mc',
    'equipment',
    'Additive Manufacturing',
    'Industrial-grade FDM system capable of printing manufacturing tooling, production parts, and functional aerospace prototypes in ULTEM 9085, Antero 800NA, and Nylon 12CF.',
    JSON.stringify({
      build_volume: '406 x 355 x 406 mm',
      layer_thickness: '0.127 mm (127 microns)',
      supported_materials: ['ULTEM 9085', 'Nylon 12 Carbon Fiber', 'PC-ISO', 'ABS-M30'],
      chamber_temp: 'Up to 225°C',
      software_support: 'GrabCAD Print / Insight'
    }),
    'Central Campus',
    'FabLab Complex & Prototyping Wing',
    'Bay 104',
    350,
    1500,
    30, // 30m buffer
    'user-owner-aris',
    'in_use',
    'pristine',
    'SN-F450-9921',
    'IXP-450MC-001',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    new Date(Date.now() - 90 * 86400000).toISOString()
  );

  // Res 2: Markforged X7 (Alternative for Stratasys)
  insertResource.run(
    'res-markforged-x7',
    'Markforged X7 Industrial Carbon Fiber 3D Printer',
    'markforged-x7-carbon',
    'equipment',
    'Additive Manufacturing',
    'Continuous fiber reinforcement system for mission-critical parts matching machined aluminum strength. Features in-process laser micrometer inspection with sub-50-micron verification.',
    JSON.stringify({
      build_volume: '330 x 270 x 200 mm',
      reinforcement_fibers: ['Continuous Carbon Fiber', 'Kevlar', 'High-Strength Fiberglass'],
      laser_inspection: 'Real-time in-situ bed scan (±25 µm)',
      base_material: 'Onyx (Micro-carbon filled nylon)'
    }),
    'Central Campus',
    'FabLab Complex & Prototyping Wing',
    'Bay 106',
    400,
    2000,
    45,
    'user-owner-aris',
    'available',
    'pristine',
    'SN-MFX7-4819',
    'IXP-MFX7-002',
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
    new Date(Date.now() - 80 * 86400000).toISOString()
  );

  // Res 3: JEOL FE-SEM
  insertResource.run(
    'res-jeol-sem',
    'JEOL JSM-IT800 Field Emission SEM',
    'jeol-jsm-it800-sem',
    'equipment',
    'Electron Microscopy',
    'Ultra-high resolution field emission scanning electron microscope with Schottky field emission gun, sub-nanometer resolution at 15 kV, and integrated Energy Dispersive X-ray Spectroscopy (EDS).',
    JSON.stringify({
      resolution: '0.7 nm at 15 kV, 1.0 nm at 1 kV',
      magnification: 'x10 to x2,000,000',
      detectors: ['Upper Electron Detector (UED)', 'Backscatter (BED)', 'Oxford EDS AztecLive'],
      vacuum_level: '< 1e-4 Pa'
    }),
    'North Research Park',
    'NanoScience & Quantum Center',
    'Chamber 012',
    1200,
    5000,
    60,
    'user-owner-elena',
    'available',
    'pristine',
    'SN-JEOL-8832',
    'IXP-SEM8-003',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
    new Date(Date.now() - 100 * 86400000).toISOString()
  );

  // Res 4: RED V-Raptor 8K Camera
  insertResource.run(
    'res-red-vraptor',
    'RED V-Raptor 8K VV Multi-Format Cinema Package',
    'red-v-raptor-8k',
    'equipment',
    'Optical Instrumentation',
    'Multi-format 35.4 Megapixel CMOS sensor capturing 8K 120fps and 4K 240fps for high-speed fluid dynamics, ballistic particle tracking, and ultra-high-definition experimental research capture.',
    JSON.stringify({
      sensor: '35.4 Megapixel VV CMOS (40.96 mm x 21.60 mm)',
      max_frame_rate: '120 fps at 8K 17:9, 240 fps at 4K',
      dynamic_range: '17+ stops',
      mount: 'Locking RF Mount with Canon EF & PL adapters'
    }),
    'South Media Center',
    'Sensor & Optics Innovation Lab',
    'Studio C',
    850,
    8000,
    45,
    'user-owner-aris',
    'available',
    'good',
    'SN-REDV-2931',
    'IXP-RED8-004',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    new Date(Date.now() - 40 * 86400000).toISOString()
  );

  // Res 5: Keysight Real-Time Oscilloscope
  insertResource.run(
    'res-keysight-33ghz',
    'Keysight Infiniium UXR-Series 33 GHz Oscilloscope',
    'keysight-uxr-33ghz',
    'equipment',
    'RF & Signal Metrology',
    '4-channel ultra-low noise real-time oscilloscope providing 128 GSa/s sample rate per channel with 10-bit hardware analog-to-digital resolution for 5G/6G, PCIe Gen5/6, and optical transceiver validation.',
    JSON.stringify({
      bandwidth: '33 GHz across 4 real-time channels',
      sample_rate: '128 GSa/s per channel',
      adc_bits: '10-bit high-definition ADC',
      jitter_noise_floor: '< 25 fs rms'
    }),
    'Central Campus',
    'Electrical & Microwave Engineering',
    'Lab 310',
    600,
    3000,
    30,
    'user-owner-aris',
    'available',
    'pristine',
    'SN-KS-33GHZ-11',
    'IXP-OSC3-005',
    'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800&auto=format&fit=crop&q=80',
    new Date(Date.now() - 50 * 86400000).toISOString()
  );

  // Res 6: ISO Class 5 Cleanroom Bay
  insertResource.run(
    'res-cleanroom-alpha',
    'ISO Class 5 (Fed-Std 209E Class 100) Cleanroom Bay',
    'cleanroom-bay-alpha',
    'space',
    'Controlled Environment',
    'Laminar airflow facility with HEPA/ULPA filtration maintaining fewer than 3,520 particles (≥0.5µm) per cubic meter. Equipped with Laurell spin coaters, mask aligner, and chemical wet benches.',
    JSON.stringify({
      iso_classification: 'ISO 14644-1 Class 5',
      air_changes_per_hour: '300+ changes/hour',
      temperature_stability: '20.0°C ± 0.2°C',
      humidity_control: '45% RH ± 2% RH',
      included_stations: ['Laurell WS-650 Spin Coater', 'SUSS MicroTec Mask Aligner', 'Piranha Acid Wet Bench']
    }),
    'North Research Park',
    'NanoScience & Quantum Center',
    'Bay Alpha',
    1800,
    8000,
    60,
    'user-owner-elena',
    'available',
    'pristine',
    'FAC-CR5-01',
    'IXP-CR5A-006',
    'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800&auto=format&fit=crop&q=80',
    new Date(Date.now() - 110 * 86400000).toISOString()
  );

  // Res 7: Autonomous Drone Flight Arena
  insertResource.run(
    'res-drone-arena',
    'Autonomous UAV Flight Arena with 16-Camera Vicon MoCap',
    'drone-mocap-arena',
    'space',
    'Experimental Robotics',
    '12m x 12m x 6m netted high-bay airspace surrounded by 16 synchronized Vicon Vantage V5 optical motion tracking cameras for sub-millimeter ground truth trajectory measurement of aerial swarms.',
    JSON.stringify({
      dimensions: '12m (L) x 12m (W) x 6m (H)',
      tracking_system: '16x Vicon Vantage V5 (420 fps @ 5 MP)',
      safety_features: 'Dual-layer Kevlar safety netting, emergency floor drop switch, fire suppression',
      payload_charging: '4x 24V/48V 60A DC regulated bench supplies'
    }),
    'Robotics Valley',
    'Autonomous Systems Pavilion',
    'Arena 1',
    750,
    2500,
    30,
    'user-owner-aris',
    'available',
    'good',
    'FAC-UAV-07',
    'IXP-UAVC-007',
    'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80',
    new Date(Date.now() - 60 * 86400000).toISOString()
  );

  // Res 8: Anechoic Chamber
  insertResource.run(
    'res-anechoic-chamber',
    'Full Anechoic Acoustic & RF Isolation Suite',
    'anechoic-acoustic-chamber',
    'space',
    'Acoustic & Vibration Testing',
    'Double-walled isolated chamber lined with 1.2-meter fiberglass wedge absorbers, achieving cut-off frequency of 60 Hz with background noise floor below -2 dBA for precision acoustic localization.',
    JSON.stringify({
      cutoff_frequency: '60 Hz (99% sound absorption)',
      background_noise: '< -2 dBA sound pressure level',
      dimensions: '8m x 6m x 5m free-field working volume',
      instrumentation: ['Bruel & Kjaer 1/2" Free-field Microphones', 'B&K Sound Level Meter 2270']
    }),
    'Central Campus',
    'Acoustics & Vibration Institute',
    'Chamber 04',
    500,
    2000,
    30,
    'user-owner-aris',
    'available',
    'pristine',
    'FAC-ANE-03',
    'IXP-ANE3-008',
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
    new Date(Date.now() - 75 * 86400000).toISOString()
  );

  // Res 9: NVIDIA H100 Node
  insertResource.run(
    'res-nvidia-h100',
    'NVIDIA HGX H100 8x80GB SXM5 Dedicated Slurm Node',
    'nvidia-h100-node',
    'digital',
    'High Performance Compute',
    'Dedicated node featuring 8x NVIDIA H100 SXM5 GPUs with NVLink 4 (900 GB/s bisectional bandwidth), 640GB aggregate HBM3, dual AMD EPYC 9654 96-core processors, and 3.2 Tbps InfiniBand.',
    JSON.stringify({
      gpu_specs: '8x NVIDIA H100 80GB SXM5 (Transformer Engine FP8 32 PFLOPS)',
      interconnect: 'NVLink 4 (900 GB/s) + 400 Gbps OSFP Quantum-2 InfiniBand',
      host_ram: '2.0 TB DDR5 4800 MHz ECC',
      storage: '30 TB NVMe PCIe Gen5 scratch space (/scratch/local)'
    }),
    'North Research Park',
    'Tier-1 Supercomputing Facility',
    'Rack B12-U18',
    250,
    0,
    15,
    'user-owner-elena',
    'available',
    'pristine',
    'DIG-H100-NODE4',
    'IXP-H100-009',
    'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80',
    new Date(Date.now() - 95 * 86400000).toISOString()
  );

  // Res 10: Ansys Rocky & Fluent License Slot
  insertResource.run(
    'res-ansys-license',
    'Ansys Rocky DEM & Fluent CFD Dedicated Token Allocation',
    'ansys-rocky-fluent-token',
    'digital',
    'Engineering Simulation',
    'Authorized floating license token providing full multi-GPU acceleration for discrete element method (DEM) granular flow and coupled turbulent computational fluid dynamics without core count limits.',
    JSON.stringify({
      software_version: 'Ansys Rocky 2026 R1 & Ansys Fluent',
      gpu_acceleration: 'Multi-GPU CUDA engine enabled (unlimited SM)',
      physics_capabilities: 'Non-round particle DEM, liquid bridge cohesion, conjugate heat transfer',
      license_manager: 'FLEXlm authorized campus token'
    }),
    'Central Campus',
    'Digital Engineering Center',
    'Cloud Cluster 01',
    180,
    0,
    10,
    'user-owner-aris',
    'available',
    'pristine',
    'DIG-ANSYS-FL4',
    'IXP-ANSY-010',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    new Date(Date.now() - 85 * 86400000).toISOString()
  );

  // 5. Resource Skills Linking (SkillGate prerequisites)
  const insertResourceSkill = db.prepare(`
    INSERT INTO resource_skills (id, resource_id, skill_id, is_mandatory)
    VALUES (?, ?, ?, ?)
  `);

  insertResourceSkill.run('rsk-1', 'res-stratasys-450mc', 'skill-fdm', 1);
  insertResourceSkill.run('rsk-2', 'res-markforged-x7', 'skill-fdm', 1);
  insertResourceSkill.run('rsk-3', 'res-jeol-sem', 'skill-sem', 1);
  insertResourceSkill.run('res-cleanroom-alpha-sk', 'res-cleanroom-alpha', 'skill-cleanroom', 1);
  insertResourceSkill.run('res-h100-sk', 'res-nvidia-h100', 'skill-hpc', 1);

  // 6. Bookings (Crafted for real user journeys)
  const insertBooking = db.prepare(`
    INSERT INTO bookings (
      id, resource_id, user_id, start_time, end_time, scheduled_return_time,
      actual_return_time, status, purpose, total_cost, delay_minutes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // BKG 1: Dev Patel currently using Stratasys 450mc.
  // Started 2 hours ago. Due in 30 minutes!
  const bkg1Start = new Date(Date.now() - 2 * 3600000);
  const bkg1End = new Date(Date.now() + 30 * 60000);
  insertBooking.run(
    'bkg-live-dev',
    'res-stratasys-450mc',
    'user-dev',
    bkg1Start.toISOString(),
    bkg1End.toISOString(),
    bkg1End.toISOString(),
    null,
    'in_progress',
    'Rapid fabrication of lightweight titanium-reinforced bionic gripper linkages for Master Thesis defense.',
    875,
    0,
    new Date(Date.now() - 24 * 3600000).toISOString(),
    bkg1Start.toISOString()
  );

  // BKG 2: Anya Sharma booked next on Stratasys 450mc!
  // Starts 1 hour from now (30m after Dev + 30m turnaround buffer)
  const bkg2Start = new Date(Date.now() + 60 * 60000);
  const bkg2End = new Date(Date.now() + 3 * 3600000);
  insertBooking.run(
    'bkg-next-anya',
    'res-stratasys-450mc',
    'user-anya',
    bkg2Start.toISOString(),
    bkg2End.toISOString(),
    bkg2End.toISOString(),
    null,
    'confirmed',
    'Bio-compatible microfluidic manifold scaffold printing in medical-grade PC-ISO for cellular culture trials.',
    700,
    0,
    new Date(Date.now() - 12 * 3600000).toISOString(),
    new Date(Date.now() - 12 * 3600000).toISOString()
  );

  // BKG 3: Dev Patel completed booking on Drone MoCap Arena yesterday (Returned in pristine condition)
  const bkg3Start = new Date(Date.now() - 28 * 3600000);
  const bkg3End = new Date(Date.now() - 25 * 3600000);
  insertBooking.run(
    'bkg-past-drone',
    'res-drone-arena',
    'user-dev',
    bkg3Start.toISOString(),
    bkg3End.toISOString(),
    bkg3End.toISOString(),
    bkg3End.toISOString(),
    'returned',
    'Ground-truth optical localization and tracking test for autonomous obstacle avoidance quadrotor.',
    2250,
    0,
    new Date(Date.now() - 48 * 3600000).toISOString(),
    bkg3End.toISOString()
  );

  // BKG 4: Kabir Mehta has a pending request on RED Cinema camera
  const bkg4Start = new Date(Date.now() + 24 * 3600000);
  const bkg4End = new Date(Date.now() + 28 * 3600000);
  insertBooking.run(
    'bkg-pending-kabir',
    'res-red-vraptor',
    'user-kabir',
    bkg4Start.toISOString(),
    bkg4End.toISOString(),
    bkg4End.toISOString(),
    null,
    'pending',
    'High-speed 240fps shadowgraph imaging of supersonic shockwave vortex shedding in low-pressure tube.',
    3400,
    0,
    new Date(Date.now() - 4 * 3600000).toISOString(),
    new Date(Date.now() - 4 * 3600000).toISOString()
  );

  // BKG 5: Anya Sharma on Cleanroom Bay Alpha (Confirmed for tomorrow)
  const bkg5Start = new Date(Date.now() + 18 * 3600000);
  const bkg5End = new Date(Date.now() + 22 * 3600000);
  insertBooking.run(
    'bkg-cleanroom-anya',
    'res-cleanroom-alpha',
    'user-anya',
    bkg5Start.toISOString(),
    bkg5End.toISOString(),
    bkg5End.toISOString(),
    null,
    'confirmed',
    'Photolithography pattern transfer and spin coating of SU-8 photoresist on 4-inch silicon substrate.',
    7200,
    0,
    new Date(Date.now() - 18 * 3600000).toISOString(),
    new Date(Date.now() - 18 * 3600000).toISOString()
  );

  // 7. Waitlist
  const insertWaitlist = db.prepare(`
    INSERT INTO waitlist (
      id, resource_id, user_id, requested_start, requested_end, priority_score, queue_position, status, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertWaitlist.run(
    'wl-1',
    'res-stratasys-450mc',
    'user-kabir',
    new Date(Date.now() + 60 * 60000).toISOString(),
    new Date(Date.now() + 3 * 3600000).toISOString(),
    68,
    1,
    'waiting',
    'Requested slot overlaps with confirmed booking bkg-next-anya. Position 1 assigned based on Academic Priority score.',
    new Date(Date.now() - 6 * 3600000).toISOString()
  );

  // 8. Condition Reports
  const insertConditionReport = db.prepare(`
    INSERT INTO condition_reports (
      id, booking_id, resource_id, report_type, condition_rating, checklist, discrepancies, photo_url, reported_by, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Checkout report for Dev Patel on Stratasys
  insertConditionReport.run(
    'rep-dev-checkout',
    'bkg-live-dev',
    'res-stratasys-450mc',
    'checkout',
    'pristine',
    JSON.stringify({
      bed_leveled: true,
      nozzle_purged: true,
      chamber_clean: true,
      material_loaded: 'ULTEM 9085 Natural Spool 84%',
      safety_interlocks_active: true
    }),
    null,
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80',
    'user-dev',
    bkg1Start.toISOString()
  );

  // Checkout & return reports for Drone arena
  insertConditionReport.run(
    'rep-drone-checkout',
    'bkg-past-drone',
    'res-drone-arena',
    'checkout',
    'pristine',
    JSON.stringify({
      netting_secured: true,
      cameras_calibrated: true,
      safety_stop_tested: true,
      floor_cleared: true
    }),
    null,
    'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&auto=format&fit=crop&q=80',
    'user-dev',
    bkg3Start.toISOString()
  );

  insertConditionReport.run(
    'rep-drone-return',
    'bkg-past-drone',
    'res-drone-arena',
    'return',
    'pristine',
    JSON.stringify({
      netting_secured: true,
      cameras_calibrated: true,
      safety_stop_tested: true,
      floor_cleared: true,
      all_marker_spheres_returned: true
    }),
    'Zero damage observed. Floor vacuumed, motion tracking ground marker re-centered to origin.',
    'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&auto=format&fit=crop&q=80',
    'user-dev',
    bkg3End.toISOString()
  );

  // 9. Maintenance Records
  const insertMaintenance = db.prepare(`
    INSERT INTO maintenance_records (
      id, resource_id, technician_id, maintenance_type, description, parts_replaced, cost, timestamp, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMaintenance.run(
    'maint-1',
    'res-stratasys-450mc',
    'user-owner-aris',
    'calibration',
    'Quarterly thermal chamber re-calibration and T16 tip liquefier replacement. Verified extrusion flow rate with 0.1mm test cube.',
    'T16 Hardened Tip, Vacuum Platen Seal Ring',
    4500,
    new Date(Date.now() - 14 * 86400000).toISOString(),
    'completed'
  );

  insertMaintenance.run(
    'maint-2',
    'res-jeol-sem',
    'user-owner-elena',
    'routine_inspection',
    'Schottky FEG gun degassing and aperture alignment. Replaced ion getter pump bakeout seal.',
    'UHV Flange Copper Gasket',
    18200,
    new Date(Date.now() - 25 * 86400000).toISOString(),
    'completed'
  );

  // 10. Notifications
  const insertNotification = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, link, read_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertNotification.run(
    'notif-1',
    'user-dev',
    'Active Session Milestone',
    'Your reservation on Stratasys Fortus 450mc has reached 80% duration. Scheduled return is at ' + bkg1End.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '.',
    'info',
    '/bookings/bkg-live-dev',
    0,
    new Date(Date.now() - 15 * 60000).toISOString()
  );

  insertNotification.run(
    'notif-2',
    'user-owner-aris',
    'Pending Booking Request',
    'Kabir Mehta submitted a reservation request for RED V-Raptor 8K Cinema Camera for review.',
    'warning',
    '/owner/requests',
    0,
    new Date(Date.now() - 4 * 3600000).toISOString()
  );

  // 11. Audit Events
  const insertAudit = db.prepare(`
    INSERT INTO audit_events (id, entity_type, entity_id, action, actor_id, payload, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertAudit.run(
    'aud-1',
    'booking',
    'bkg-live-dev',
    'CHECKOUT_VERIFIED',
    'user-dev',
    JSON.stringify({ condition_score: 'pristine', verified_checklist_items: 5 }),
    bkg1Start.toISOString()
  );

  insertAudit.run(
    'aud-2',
    'booking',
    'bkg-next-anya',
    'RESERVATION_CONFIRMED',
    'user-owner-aris',
    JSON.stringify({ auto_confirmed: true, verified_skill_checked: 'Stratasys FDM Industrial Operator' }),
    new Date(Date.now() - 12 * 3600000).toISOString()
  );

  console.log('✅ Seed completed: 6 users, 5 skills, 10 resources, 5 bookings, 1 waitlist, 3 condition reports, 2 maintenance records, 2 notifications, 2 audit events.');
}

// If run directly
if (require.main === module) {
  seedDatabase();
}

