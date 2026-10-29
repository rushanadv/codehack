import { getDb } from './db';

export function seedDatabase() {
  const db = getDb();

  // Clear existing data cleanly in foreign key sequence
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

  // =========================================================================
  // 1. USERS (Fictional Sandbox Personas with Distinct Roles)
  // =========================================================================
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, name, role, department, institution, avatar, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    'user-dev',
    'dev.patel@aerogrid-demo.internal',
    'Dev Patel',
    'user',
    'Autonomous Robotics Division',
    'AeroGrid Systems (Fictional)',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    new Date(Date.now() - 60 * 86400000).toISOString()
  );

  insertUser.run(
    'user-owner-aris',
    'dr.aris.vance@apex-demo.internal',
    'Dr. Aris Vance',
    'owner',
    'Additive Manufacturing Core',
    'Apex Research Labs (Fictional)',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    new Date(Date.now() - 120 * 86400000).toISOString()
  );

  insertUser.run(
    'user-owner-elena',
    'prof.elena.rostova@vanguard-demo.internal',
    'Prof. Elena Rostova',
    'owner',
    'Microfabrication & Metrology',
    'Vanguard Advanced Dynamics (Fictional)',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    new Date(Date.now() - 150 * 86400000).toISOString()
  );

  insertUser.run(
    'user-admin-raman',
    'dean.raman@idlex-demo.internal',
    'Dean S. Raman',
    'admin',
    'Platform Operations & Governance',
    'IdleX Exchange Authority (Fictional)',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    new Date(Date.now() - 200 * 86400000).toISOString()
  );

  insertUser.run(
    'user-anya',
    'anya.sharma@kinetics-demo.internal',
    'Anya Sharma',
    'user',
    'Biomedical Device Prototyping',
    'Kinetics Innovation Hub (Fictional)',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    new Date(Date.now() - 45 * 86400000).toISOString()
  );

  insertUser.run(
    'user-kabir',
    'kabir.mehta@aerogrid-demo.internal',
    'Kabir Mehta',
    'user',
    'Aerospace Dynamics Group',
    'AeroGrid Systems (Fictional)',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    new Date(Date.now() - 20 * 86400000).toISOString()
  );

  // =========================================================================
  // 2. SKILLS (SkillGate Safety Certifications)
  // =========================================================================
  const insertSkill = db.prepare(`
    INSERT INTO skills (id, name, category, description)
    VALUES (?, ?, ?, ?)
  `);

  insertSkill.run('skill-fdm', 'Stratasys FDM Industrial Operator', 'Fabrication', 'Certified to operate high-temp industrial thermoplastic extrusion printers.');
  insertSkill.run('skill-laser', 'Laser Safety Level 2', 'Lab Safety', 'Verification of high-energy collimated beam safety and protective shielding protocols.');
  insertSkill.run('skill-cleanroom', 'Cleanroom Protocol Class 1000', 'Nanofab', 'Gowning, particle containment, and contamination control certification.');
  insertSkill.run('skill-sem', 'Electron Microscopy (FE-SEM) Certified', 'Metrology', 'Vacuum chamber pumpdown, electron beam filament alignment, and EDX calibration.');
  insertSkill.run('skill-hpc', 'Slurm HPC Clearance Tier 1', 'Compute', 'Multi-node GPU allocation scripting and memory pinning authorization.');
  insertSkill.run('skill-machining', '5-Axis CNC Precision Machining Clearance', 'Machining', 'Tool path validation, spindle feed control, and emergency stop interlock verification.');

  // =========================================================================
  // 3. USER SKILLS (SkillGate Records)
  // =========================================================================
  const insertUserSkill = db.prepare(`
    INSERT INTO user_skills (id, user_id, skill_id, status, certificate_ref, verified_at, verified_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertUserSkill.run('usk-1', 'user-dev', 'skill-fdm', 'verified', 'CERT-FDM-2026-081', new Date(Date.now() - 30 * 86400000).toISOString(), 'user-owner-aris');
  insertUserSkill.run('usk-2', 'user-dev', 'skill-laser', 'verified', 'CERT-LS2-2025-412', new Date(Date.now() - 60 * 86400000).toISOString(), 'user-admin-raman');
  insertUserSkill.run('usk-3', 'user-anya', 'skill-cleanroom', 'verified', 'CERT-CR1-2026-104', new Date(Date.now() - 15 * 86400000).toISOString(), 'user-owner-elena');
  insertUserSkill.run('usk-4', 'user-anya', 'skill-fdm', 'verified', 'CERT-FDM-2026-095', new Date(Date.now() - 10 * 86400000).toISOString(), 'user-owner-aris');
  insertUserSkill.run('usk-5', 'user-kabir', 'skill-sem', 'pending', 'SUBM-SEM-PENDING', null, null);
  insertUserSkill.run('usk-6', 'user-dev', 'skill-machining', 'verified', 'CERT-CNC-2025-882', new Date(Date.now() - 40 * 86400000).toISOString(), 'user-owner-aris');

  // =========================================================================
  // 4. CENTRAL DEMO DATASET (12 Realistic Fictional Resources)
  // =========================================================================
  const insertResource = db.prepare(`
    INSERT INTO resources (
      id, title, slug, category, subcategory, description, specifications,
      location, building, room, hourly_rate, deposit, turnaround_buffer_mins,
      owner_id, status, condition_rating, serial_number, passport_id, image_url, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // --- PROPERTY & SPACES (3 Resources) ---

  // 1. Microfabrication Cleanroom Bay
  insertResource.run(
    'res-cleanroom-alpha',
    'Controlled Microfabrication Cleanroom Bay',
    'controlled-microfabrication-cleanroom-bay',
    'space',
    'Controlled Environment',
    'ISO Class 5 laminar airflow facility featuring positive pressure filtration, Laurell spin coaters, and high-purity chemical wet benches for substrate preparation.',
    JSON.stringify({
      iso_class: 'ISO 14644-1 Class 5',
      air_changes: '300+ changes / hour',
      temperature: '20.0°C ± 0.2°C',
      relative_humidity: '45% RH ± 2% RH',
      equipment_included: ['Laurell WS-650 Spin Coater', 'Optical Mask Aligner', 'Piranha Acid Wet Bench']
    }),
    'Tech District',
    'Vanguard Nanofabrication Center (Fictional)',
    'Bay 102',
    140,
    600,
    60,
    'user-owner-elena',
    'available',
    'pristine',
    'FAC-CR5-01',
    'IXP-CR5A-001',
    'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800&auto=format&fit=crop&q=80',
    new Date(Date.now() - 110 * 86400000).toISOString()
  );

  // 2. Thermal & Environmental Test Chamber
  insertResource.run(
    'res-climate-chamber',
    'Thermal & Environmental Stress Test Chamber',
    'thermal-environmental-stress-chamber',
    'space',
    'Environmental Testing',
    'Walk-in programmable climate test chamber providing broad temperature cycling (-70°C to +180°C) and relative humidity control with multi-port telemetry pass-throughs.',
    JSON.stringify({
      temperature_range: '-70°C to +180°C (ramp rate 5°C/min)',
      humidity_range: '10% to 98% RH',
      interior_volume: '3.2m x 2.4m x 2.2m',
      instrumentation_ports: '4x 100mm vacuum-rated feedthroughs'
    }),
    'North Research Sector',
    'Vanguard Environmental Dynamics (Fictional)',
    'Testing Cell 4',
    95,
    300,
    30,
    'user-owner-elena',
    'available',
    'pristine',
    'FAC-ENV-04',
    'IXP-ENVC-002',
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
    new Date(Date.now() - 95 * 86400000).toISOString()
  );

  // 3. Shared Prototyping & Assembly Suite
  insertResource.run(
    'res-prototyping-suite',
    'Shared Rapid Prototyping & Assembly Suite',
    'shared-rapid-prototyping-assembly-suite',
    'space',
    'Prototyping Facility',
    'Electrostatic discharge (ESD) safe bench facility equipped with Hakko micro-soldering stations, stereoscopic inspection optics, and continuous nitrogen purge lines.',
    JSON.stringify({
      workbenches: '4 fully equipped ESD-dissipative workstations',
      inspection_optics: 'Leica S9D stereo microscopes with 4K HDMI out',
      soldering_tools: 'Hakko FX-951 stations with pre-heating plates',
      power_supplies: 'Keysight triple-output programmable DC supplies'
    }),
    'Central Campus',
    'Kinetics Prototyping Hub (Fictional)',
    'Suite 210',
    65,
    200,
    30,
    'user-owner-aris',
    'available',
    'pristine',
    'FAC-PROTO-21',
    'IXP-PRTO-003',
    'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800&auto=format&fit=crop&q=80',
    new Date(Date.now() - 75 * 86400000).toISOString()
  );

  // --- PHYSICAL ASSETS (5 Resources) ---

  // 4. Stratasys Fortus 450mc Production 3D Printer
  insertResource.run(
    'res-stratasys-450mc',
    'Stratasys Fortus 450mc Production 3D Printer',
    'stratasys-fortus-450mc',
    'equipment',
    'Additive Manufacturing',
    'Industrial FDM production system engineered for functional aerospace fixtures and high-strength engineering components in ULTEM 9085 and Nylon 12 Carbon Fiber.',
    JSON.stringify({
      build_volume: '406 x 355 x 406 mm',
      layer_resolution: '0.127 mm (127 microns)',
      supported_materials: ['ULTEM 9085', 'Nylon 12CF', 'PC-ISO', 'Antero 800NA'],
      chamber_temperature: 'Regulated up to 225°C',
      software_pipeline: 'GrabCAD Print with Insight G-code compiler'
    }),
    'Central Campus',
    'Apex Additive Systems (Fictional)',
    'Bay 104',
    110,
    450,
    30, // 30m turnaround buffer
    'user-owner-aris',
    'in_use',
    'pristine',
    'SN-F450-9921',
    'IXP-450MC-004',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    new Date(Date.now() - 90 * 86400000).toISOString()
  );

  // 5. Markforged X7 Industrial Carbon Fiber 3D Printer (Alternative for Stratasys)
  insertResource.run(
    'res-markforged-x7',
    'Markforged X7 Industrial Carbon Fiber 3D Printer',
    'markforged-x7-carbon',
    'equipment',
    'Additive Manufacturing',
    'Continuous composite fiber deposition platform producing parts matching machined 6061-T6 aluminum tensile performance with integrated in-situ laser micrometer scanning.',
    JSON.stringify({
      build_volume: '330 x 270 x 200 mm',
      reinforcement_fibers: ['Continuous Carbon Fiber', 'Kevlar', 'High-Strength Fiberglass'],
      laser_inspection: 'Real-time bed topography scan (±25 µm precision)',
      matrix_material: 'Onyx micro-carbon filled nylon'
    }),
    'Central Campus',
    'Apex Additive Systems (Fictional)',
    'Bay 106',
    125,
    500,
    45,
    'user-owner-aris',
    'available',
    'pristine',
    'SN-MFX7-4819',
    'IXP-MFX7-005',
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
    new Date(Date.now() - 80 * 86400000).toISOString()
  );

  // 6. Hermle 5-Axis Precision Machining Center
  insertResource.run(
    'res-cnc-5axis',
    'Hermle 5-Axis Precision Machining Center',
    'hermle-5-axis-cnc-machining-center',
    'equipment',
    'Precision Machining',
    'High-rigidity simultaneous 5-axis CNC machining system featuring Heidenhain TNC controls, Renishaw optical part touch-probing, and 20,000 RPM high-torque spindle.',
    JSON.stringify({
      travel_xyz: '650 x 600 x 500 mm',
      spindle_speed: '20,000 RPM (Haimer HSK-A63)',
      accuracy: 'Linear positioning ±0.003 mm',
      probing_system: 'Renishaw OMP60 optical probe with laser tool setting'
    }),
    'Hangar Sector',
    'AeroGrid Precision Engineering (Fictional)',
    'Machining Cell B',
    175,
    800,
    45,
    'user-owner-aris',
    'available',
    'good',
    'SN-H5X-3012',
    'IXP-CNC5-006',
    'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
    new Date(Date.now() - 65 * 86400000).toISOString()
  );

  // 7. Non-Contact 3D Optical Surface Profilometer
  insertResource.run(
    'res-optical-profilometer',
    'Non-Contact 3D Optical Surface Profilometer',
    'non-contact-3d-optical-surface-profilometer',
    'equipment',
    'Metrology & Inspection',
    'Coherence-scanning white light interferometer providing sub-nanometer vertical step height resolution for micro-fluidic channels, polished optics, and MEMS structures.',
    JSON.stringify({
      vertical_resolution: '< 0.1 nm (Phase Shifting Interferometry)',
      lateral_resolution: '0.35 µm',
      field_of_view: '0.14 to 7.0 mm (with automated stitching)',
      measurement_types: ['Surface Roughness (Sa, Sq)', 'Step Height', 'Thin Film Topography']
    }),
    'Tech District',
    'Vanguard Metrology Core (Fictional)',
    'Precision Lab 3',
    130,
    500,
    30,
    'user-owner-elena',
    'available',
    'pristine',
    'SN-WLI-508',
    'IXP-OPTI-007',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
    new Date(Date.now() - 70 * 86400000).toISOString()
  );

  // 8. Keysight 33 GHz Real-Time Oscilloscope & RF Bench
  insertResource.run(
    'res-keysight-33ghz',
    'Keysight 33 GHz Real-Time Oscilloscope & RF Bench',
    'keysight-uxr-33ghz-rf-bench',
    'equipment',
    'RF & Signal Metrology',
    'Ultra-low noise real-time instrument delivering 128 GSa/s simultaneous sampling across 4 channels with 10-bit analog-to-digital resolution for high-frequency signal integrity validation.',
    JSON.stringify({
      analog_bandwidth: '33 GHz on 4 channels',
      sample_rate: '128 GSa/s per channel',
      adc_resolution: '10-bit high-definition ADC architecture',
      intrinsic_jitter: '< 25 fs rms'
    }),
    'East Engineering Wing',
    'Kinetics Signal Dynamics (Fictional)',
    'RF Lab 310',
    140,
    600,
    30,
    'user-owner-aris',
    'available',
    'pristine',
    'SN-KS-33G-11',
    'IXP-OSC3-008',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    new Date(Date.now() - 50 * 86400000).toISOString()
  );

  // --- DIGITAL & TECH (4 Resources) ---

  // 9. Dedicated 8x NVIDIA H100 SXM5 Compute Instance
  insertResource.run(
    'res-nvidia-h100',
    'Dedicated 8x NVIDIA H100 SXM5 Compute Instance',
    'dedicated-8x-nvidia-h100-sxm5-compute-instance',
    'digital',
    'High Performance Compute',
    'Dedicated GPU node featuring 8x NVIDIA H100 80GB SXM5 GPUs interconnected via NVLink 4 (900 GB/s), 2.0 TB DDR5 memory, and 3.2 Tbps InfiniBand cluster fabric.',
    JSON.stringify({
      accelerators: '8x NVIDIA H100 80GB SXM5 (Transformer Engine FP8)',
      interconnect: 'NVLink 4 + 400 Gbps OSFP Quantum-2 InfiniBand',
      system_memory: '2.0 TB DDR5 4800 MHz ECC',
      local_scratch: '30 TB NVMe PCIe Gen5 high-throughput storage'
    }),
    'North Research Sector',
    'Vanguard Compute Collective (Fictional)',
    'Cluster Node Rack B12',
    85,
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

  // 10. Parallel CFD & Multi-Physics Compute Allocation
  insertResource.run(
    'res-sim-cluster',
    'Parallel Multi-Physics & CFD Compute Allocation',
    'parallel-multi-physics-cfd-compute-allocation',
    'digital',
    'Scientific Simulation',
    'Dedicated 128-core high-throughput parallel compute partition configured with OpenFOAM, Ansys Fluent, and pre-compiled MPI solvers with priority Slurm scheduling.',
    JSON.stringify({
      cpu_cores: '128-core AMD EPYC 9654 processors',
      host_ram: '512 GB DDR5 ECC',
      mpi_stack: 'OpenMPI 5.0 with UCX InfiniBand acceleration',
      parallel_io: 'Lustre parallel scratch storage partition'
    }),
    'Hangar Sector',
    'AeroGrid Simulation Core (Fictional)',
    'Cluster Node Rack C-11',
    55,
    0,
    15,
    'user-owner-aris',
    'available',
    'pristine',
    'DIG-CFD-NODE1',
    'IXP-CFD1-010',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    new Date(Date.now() - 85 * 86400000).toISOString()
  );

  // 11. Distributed Machine Learning Development Node
  insertResource.run(
    'res-ml-pipeline',
    'Distributed Machine Learning Development Node',
    'distributed-machine-learning-development-node',
    'digital',
    'Machine Learning',
    'Containerized multi-GPU training environment with 4x NVIDIA RTX 6000 Ada Generation (48GB VRAM each), JupyterLab integration, and pre-configured PyTorch 2.3.',
    JSON.stringify({
      accelerators: '4x NVIDIA RTX 6000 Ada (192GB aggregate VRAM)',
      system_memory: '256 GB DDR5',
      environment: 'Docker / PyTorch 2.3 / vLLM / HuggingFace Transformers',
      remote_access: 'SSH keypair + JupyterLab token authentication'
    }),
    'Central Campus',
    'Kinetics Deep Learning Lab (Fictional)',
    'Edge Node 03',
    45,
    0,
    10,
    'user-owner-aris',
    'available',
    'pristine',
    'DIG-ML-NODE3',
    'IXP-MLN3-011',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    new Date(Date.now() - 60 * 86400000).toISOString()
  );

  // =========================================================================
  // 5. RESOURCE SKILLS LINKING (SkillGate Prerequisites)
  // =========================================================================
  const insertResourceSkill = db.prepare(`
    INSERT INTO resource_skills (id, resource_id, skill_id, is_mandatory)
    VALUES (?, ?, ?, ?)
  `);

  insertResourceSkill.run('rsk-1', 'res-stratasys-450mc', 'skill-fdm', 1);
  insertResourceSkill.run('rsk-2', 'res-markforged-x7', 'skill-fdm', 1);
  insertResourceSkill.run('rsk-3', 'res-cnc-5axis', 'skill-machining', 1);
  insertResourceSkill.run('rsk-4', 'res-cleanroom-alpha', 'skill-cleanroom', 1);
  insertResourceSkill.run('rsk-5', 'res-nvidia-h100', 'skill-hpc', 1);

  // =========================================================================
  // 6. BOOKINGS (Deterministic State Machine Scenarios)
  // =========================================================================
  const insertBooking = db.prepare(`
    INSERT INTO bookings (
      id, resource_id, user_id, start_time, end_time, scheduled_return_time,
      actual_return_time, status, purpose, total_cost, delay_minutes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // BKG 1: Dev Patel currently using Stratasys 450mc. Started 2 hours ago. Due in 30 minutes.
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
    275,
    0,
    new Date(Date.now() - 24 * 3600000).toISOString(),
    bkg1Start.toISOString()
  );

  // BKG 2: Anya Sharma booked next on Stratasys 450mc. Starts 1 hr from now (Dev + 30m buffer).
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
    'Biocompatible microfluidic manifold scaffold printing in medical-grade PC-ISO for cellular culture trials.',
    220,
    0,
    new Date(Date.now() - 12 * 3600000).toISOString(),
    new Date(Date.now() - 12 * 3600000).toISOString()
  );

  // BKG 3: Dev Patel completed session on Prototyping Suite yesterday (Returned in pristine state).
  const bkg3Start = new Date(Date.now() - 28 * 3600000);
  const bkg3End = new Date(Date.now() - 25 * 3600000);
  insertBooking.run(
    'bkg-past-drone',
    'res-prototyping-suite',
    'user-dev',
    bkg3Start.toISOString(),
    bkg3End.toISOString(),
    bkg3End.toISOString(),
    bkg3End.toISOString(),
    'returned',
    'Precision SMD reflow soldering and wire bonding of custom brushless motor controller flight boards.',
    195,
    0,
    new Date(Date.now() - 48 * 3600000).toISOString(),
    bkg3End.toISOString()
  );

  // BKG 4: Kabir Mehta has a pending reservation on Keysight RF Bench
  const bkg4Start = new Date(Date.now() + 24 * 3600000);
  const bkg4End = new Date(Date.now() + 28 * 3600000);
  insertBooking.run(
    'bkg-pending-kabir',
    'res-keysight-33ghz',
    'user-kabir',
    bkg4Start.toISOString(),
    bkg4End.toISOString(),
    bkg4End.toISOString(),
    null,
    'pending',
    'S-parameter measurement and noise figure characterization of Ka-band radar patch antenna array.',
    560,
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
    560,
    0,
    new Date(Date.now() - 18 * 3600000).toISOString(),
    new Date(Date.now() - 18 * 3600000).toISOString()
  );

  // =========================================================================
  // 7. FAIRSHARE WAITLIST QUEUE
  // =========================================================================
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

  // =========================================================================
  // 8. CONDITION REPORTS
  // =========================================================================
  const insertConditionReport = db.prepare(`
    INSERT INTO condition_reports (
      id, booking_id, resource_id, report_type, condition_rating, checklist, discrepancies, photo_url, reported_by, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

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

  insertConditionReport.run(
    'rep-proto-checkout',
    'bkg-past-drone',
    'res-prototyping-suite',
    'checkout',
    'pristine',
    JSON.stringify({
      esd_grounding_verified: true,
      soldering_station_clean: true,
      microscopes_calibrated: true,
      fume_extraction_active: true
    }),
    null,
    'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400&auto=format&fit=crop&q=80',
    'user-dev',
    bkg3Start.toISOString()
  );

  insertConditionReport.run(
    'rep-proto-return',
    'bkg-past-drone',
    'res-prototyping-suite',
    'return',
    'pristine',
    JSON.stringify({
      esd_grounding_verified: true,
      soldering_station_clean: true,
      microscopes_calibrated: true,
      fume_extraction_active: true
    }),
    'Zero damage observed. Workstation tidied, soldering tips tinned, nitrogen valve closed.',
    'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400&auto=format&fit=crop&q=80',
    'user-dev',
    bkg3End.toISOString()
  );

  // =========================================================================
  // 9. MAINTENANCE RECORDS
  // =========================================================================
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
    'Quarterly thermal chamber re-calibration and T16 tip liquefier replacement. Verified extrusion flow rate with 0.1mm test coupon.',
    'T16 Hardened Tip, Vacuum Platen Seal Ring',
    450,
    new Date(Date.now() - 14 * 86400000).toISOString(),
    'completed'
  );

  insertMaintenance.run(
    'maint-2',
    'res-cnc-5axis',
    'user-owner-aris',
    'routine_inspection',
    'Laser tool setter calibration, spindle runout inspection (< 1.5 µm measured), and way-lube filter replacement.',
    'Way Lube Filter Cartridge, Spindle Air Purge Seal',
    620,
    new Date(Date.now() - 25 * 86400000).toISOString(),
    'completed'
  );

  // =========================================================================
  // 10. NOTIFICATIONS
  // =========================================================================
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
    'Kabir Mehta submitted a reservation request for Keysight 33 GHz RF Bench for review.',
    'warning',
    '/owner/requests',
    0,
    new Date(Date.now() - 4 * 3600000).toISOString()
  );

  // =========================================================================
  // 11. AUDIT EVENTS
  // =========================================================================
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

  console.log('✅ Seed completed: 6 users, 6 skills, 11 resources, 5 bookings, 1 waitlist, 3 condition reports, 2 maintenance records, 2 notifications, 2 audit events.');
}

// If run directly
if (require.main === module) {
  seedDatabase();
}
