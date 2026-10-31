import { Resource, User, Skill, Booking, WaitlistEntry, ConditionReport, MaintenanceRecord, DisruptionEvent, Notification, AuditEvent } from './types';

// ============================================================================
// SLOTLY CENTRAL DEMO DATASET
// Single source of truth for both Localhost SQLite and Vercel Serverless
// ============================================================================

export interface DemoDataset {
  users: User[];
  skills: Skill[];
  userSkills: {
    id: string;
    user_id: string;
    skill_id: string;
    status: 'verified' | 'pending' | 'rejected';
    certificate_ref: string | null;
    verified_at: string | null;
    verified_by: string | null;
  }[];
  resources: Resource[];
  resourceSkills: {
    id: string;
    resource_id: string;
    skill_id: string;
    is_mandatory: number;
  }[];
  bookings: Booking[];
  waitlist: WaitlistEntry[];
  conditionReports: ConditionReport[];
  maintenanceRecords: MaintenanceRecord[];
  disruptions: DisruptionEvent[];
  notifications: Notification[];
  auditEvents: AuditEvent[];
}

export function createInitialDemoData(): DemoDataset {
  const now = Date.now();
  const dayMs = 86400000;
  const hourMs = 3600000;
  const minMs = 60000;

  // 1. Users
  const users: User[] = [
    {
      id: 'user-dev',
      email: 'dev.patel@aerogrid-demo.internal',
      name: 'Dev Patel',
      role: 'user',
      department: 'Autonomous Robotics Division',
      institution: 'AeroGrid Systems (Fictional)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      created_at: new Date(now - 60 * dayMs).toISOString(),
    },
    {
      id: 'user-owner-aris',
      email: 'dr.aris.vance@apex-demo.internal',
      name: 'Dr. Aris Vance',
      role: 'owner',
      department: 'Additive Manufacturing Core',
      institution: 'Apex Research Labs (Fictional)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      created_at: new Date(now - 120 * dayMs).toISOString(),
    },
    {
      id: 'user-owner-elena',
      email: 'prof.elena.rostova@vanguard-demo.internal',
      name: 'Prof. Elena Rostova',
      role: 'owner',
      department: 'Microfabrication & Metrology',
      institution: 'Vanguard Advanced Dynamics (Fictional)',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      created_at: new Date(now - 150 * dayMs).toISOString(),
    },
    {
      id: 'user-admin-raman',
      email: 'dean.raman@slotly-demo.internal',
      name: 'Dean S. Raman',
      role: 'admin',
      department: 'Platform Operations & Governance',
      institution: 'Slotly Exchange Authority (Fictional)',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      created_at: new Date(now - 200 * dayMs).toISOString(),
    },
    {
      id: 'user-anya',
      email: 'anya.sharma@kinetics-demo.internal',
      name: 'Anya Sharma',
      role: 'user',
      department: 'Biomedical Device Prototyping',
      institution: 'Kinetics Innovation Hub (Fictional)',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      created_at: new Date(now - 45 * dayMs).toISOString(),
    },
    {
      id: 'user-kabir',
      email: 'kabir.mehta@aerogrid-demo.internal',
      name: 'Kabir Mehta',
      role: 'user',
      department: 'Aerospace Dynamics Group',
      institution: 'AeroGrid Systems (Fictional)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      created_at: new Date(now - 20 * dayMs).toISOString(),
    },
  ];

  // 2. Skills
  const skills: Skill[] = [
    {
      id: 'skill-fdm',
      name: 'Stratasys FDM Industrial Operator',
      category: 'Fabrication',
      description: 'Certified to operate high-temp industrial thermoplastic extrusion printers.',
    },
    {
      id: 'skill-laser',
      name: 'Laser Safety Level 2',
      category: 'Lab Safety',
      description: 'Verification of high-energy collimated beam safety and protective shielding protocols.',
    },
    {
      id: 'skill-cleanroom',
      name: 'Cleanroom Protocol Class 1000',
      category: 'Nanofab',
      description: 'Gowning, particle containment, and contamination control certification.',
    },
    {
      id: 'skill-sem',
      name: 'Electron Microscopy (FE-SEM) Certified',
      category: 'Metrology',
      description: 'Vacuum chamber pumpdown, electron beam filament alignment, and EDX calibration.',
    },
    {
      id: 'skill-hpc',
      name: 'Slurm HPC Clearance Tier 1',
      category: 'Compute',
      description: 'Multi-node GPU allocation scripting and memory pinning authorization.',
    },
    {
      id: 'skill-machining',
      name: '5-Axis CNC Precision Machining Clearance',
      category: 'Machining',
      description: 'Tool path validation, spindle feed control, and emergency stop interlock verification.',
    },
  ];

  // 3. User Skills
  const userSkills = [
    { id: 'usk-1', user_id: 'user-dev', skill_id: 'skill-fdm', status: 'verified' as const, certificate_ref: 'CERT-FDM-2026-081', verified_at: new Date(now - 30 * dayMs).toISOString(), verified_by: 'user-owner-aris' },
    { id: 'usk-2', user_id: 'user-dev', skill_id: 'skill-laser', status: 'verified' as const, certificate_ref: 'CERT-LS2-2025-412', verified_at: new Date(now - 60 * dayMs).toISOString(), verified_by: 'user-admin-raman' },
    { id: 'usk-3', user_id: 'user-anya', skill_id: 'skill-cleanroom', status: 'verified' as const, certificate_ref: 'CERT-CR1-2026-104', verified_at: new Date(now - 15 * dayMs).toISOString(), verified_by: 'user-owner-elena' },
    { id: 'usk-4', user_id: 'user-anya', skill_id: 'skill-fdm', status: 'verified' as const, certificate_ref: 'CERT-FDM-2026-095', verified_at: new Date(now - 10 * dayMs).toISOString(), verified_by: 'user-owner-aris' },
    { id: 'usk-5', user_id: 'user-kabir', skill_id: 'skill-sem', status: 'pending' as const, certificate_ref: 'SUBM-SEM-PENDING', verified_at: null, verified_by: null },
    { id: 'usk-6', user_id: 'user-dev', skill_id: 'skill-machining', status: 'verified' as const, certificate_ref: 'CERT-CNC-2025-882', verified_at: new Date(now - 40 * dayMs).toISOString(), verified_by: 'user-owner-aris' },
  ];

  // 4. Resources (11 Central Fictional Listings)
  const resources: Resource[] = [
    // --- PROPERTY & SPACES ---
    {
      id: 'res-cleanroom-alpha',
      title: 'Controlled Microfabrication Cleanroom Bay',
      slug: 'controlled-microfabrication-cleanroom-bay',
      category: 'space',
      subcategory: 'Controlled Environment',
      description: 'ISO Class 5 laminar airflow facility featuring positive pressure filtration, Laurell spin coaters, and high-purity chemical wet benches for substrate preparation.',
      specifications: {
        iso_class: 'ISO 14644-1 Class 5',
        air_changes: '300+ changes / hour',
        temperature: '20.0°C ± 0.2°C',
        relative_humidity: '45% RH ± 2% RH',
        equipment_included: ['Laurell WS-650 Spin Coater', 'Optical Mask Aligner', 'Piranha Acid Wet Bench'],
      },
      location: 'Tech District',
      building: 'Vanguard Nanofabrication Center (Fictional)',
      room: 'Bay 102',
      hourly_rate: 140,
      deposit: 600,
      turnaround_buffer_mins: 60,
      owner_id: 'user-owner-elena',
      status: 'available',
      condition_rating: 'pristine',
      serial_number: 'FAC-CR5-01',
      passport_id: 'IXP-CR5A-001',
      image_url: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800&auto=format&fit=crop&q=80',
      created_at: new Date(now - 110 * dayMs).toISOString(),
    },
    {
      id: 'res-climate-chamber',
      title: 'Thermal & Environmental Stress Test Chamber',
      slug: 'thermal-environmental-stress-chamber',
      category: 'space',
      subcategory: 'Environmental Testing',
      description: 'Walk-in programmable climate test chamber providing broad temperature cycling (-70°C to +180°C) and relative humidity control with multi-port telemetry pass-throughs.',
      specifications: {
        temperature_range: '-70°C to +180°C (ramp rate 5°C/min)',
        humidity_range: '10% to 98% RH',
        interior_volume: '3.2m x 2.4m x 2.2m',
        instrumentation_ports: '4x 100mm vacuum-rated feedthroughs',
      },
      location: 'North Research Sector',
      building: 'Vanguard Environmental Dynamics (Fictional)',
      room: 'Testing Cell 4',
      hourly_rate: 95,
      deposit: 300,
      turnaround_buffer_mins: 30,
      owner_id: 'user-owner-elena',
      status: 'available',
      condition_rating: 'pristine',
      serial_number: 'FAC-ENV-04',
      passport_id: 'IXP-ENVC-002',
      image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
      created_at: new Date(now - 95 * dayMs).toISOString(),
    },
    {
      id: 'res-prototyping-suite',
      title: 'Shared Rapid Prototyping & Assembly Suite',
      slug: 'shared-rapid-prototyping-assembly-suite',
      category: 'space',
      subcategory: 'Prototyping Facility',
      description: 'Electrostatic discharge (ESD) safe bench facility equipped with Hakko micro-soldering stations, stereoscopic inspection optics, and continuous nitrogen purge lines.',
      specifications: {
        workbenches: '4 fully equipped ESD-dissipative workstations',
        inspection_optics: 'Leica S9D stereo microscopes with 4K HDMI out',
        soldering_tools: 'Hakko FX-951 stations with pre-heating plates',
        power_supplies: 'Keysight triple-output programmable DC supplies',
      },
      location: 'Central Campus',
      building: 'Kinetics Prototyping Hub (Fictional)',
      room: 'Suite 210',
      hourly_rate: 65,
      deposit: 200,
      turnaround_buffer_mins: 30,
      owner_id: 'user-owner-aris',
      status: 'available',
      condition_rating: 'pristine',
      serial_number: 'FAC-PROTO-21',
      passport_id: 'IXP-PRTO-003',
      image_url: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800&auto=format&fit=crop&q=80',
      created_at: new Date(now - 75 * dayMs).toISOString(),
    },

    // --- PHYSICAL ASSETS ---
    {
      id: 'res-stratasys-450mc',
      title: 'Stratasys Fortus 450mc Production 3D Printer',
      slug: 'stratasys-fortus-450mc',
      category: 'equipment',
      subcategory: 'Additive Manufacturing',
      description: 'Industrial FDM production system engineered for functional aerospace fixtures and high-strength engineering components in ULTEM 9085 and Nylon 12 Carbon Fiber.',
      specifications: {
        build_volume: '406 x 355 x 406 mm',
        layer_resolution: '0.127 mm (127 microns)',
        supported_materials: ['ULTEM 9085', 'Nylon 12CF', 'PC-ISO', 'Antero 800NA'],
        chamber_temperature: 'Regulated up to 225°C',
        software_pipeline: 'GrabCAD Print with Insight G-code compiler',
      },
      location: 'Central Campus',
      building: 'Apex Additive Systems (Fictional)',
      room: 'Bay 104',
      hourly_rate: 110,
      deposit: 450,
      turnaround_buffer_mins: 30,
      owner_id: 'user-owner-aris',
      status: 'in_use',
      condition_rating: 'pristine',
      serial_number: 'SN-F450-9921',
      passport_id: 'IXP-450MC-004',
      image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      created_at: new Date(now - 90 * dayMs).toISOString(),
    },
    {
      id: 'res-markforged-x7',
      title: 'Markforged X7 Industrial Carbon Fiber 3D Printer',
      slug: 'markforged-x7-carbon',
      category: 'equipment',
      subcategory: 'Additive Manufacturing',
      description: 'Continuous composite fiber deposition platform producing parts matching machined 6061-T6 aluminum tensile performance with integrated in-situ laser micrometer scanning.',
      specifications: {
        build_volume: '330 x 270 x 200 mm',
        reinforcement_fibers: ['Continuous Carbon Fiber', 'Kevlar', 'High-Strength Fiberglass'],
        laser_inspection: 'Real-time bed topography scan (±25 µm precision)',
        matrix_material: 'Onyx micro-carbon filled nylon',
      },
      location: 'Central Campus',
      building: 'Apex Additive Systems (Fictional)',
      room: 'Bay 106',
      hourly_rate: 125,
      deposit: 500,
      turnaround_buffer_mins: 45,
      owner_id: 'user-owner-aris',
      status: 'available',
      condition_rating: 'pristine',
      serial_number: 'SN-MFX7-4819',
      passport_id: 'IXP-MFX7-005',
      image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
      created_at: new Date(now - 80 * dayMs).toISOString(),
    },
    {
      id: 'res-cnc-5axis',
      title: 'Hermle 5-Axis Precision Machining Center',
      slug: 'hermle-5-axis-cnc-machining-center',
      category: 'equipment',
      subcategory: 'Precision Machining',
      description: 'High-rigidity simultaneous 5-axis CNC machining system featuring Heidenhain TNC controls, Renishaw optical part touch-probing, and 20,000 RPM high-torque spindle.',
      specifications: {
        travel_xyz: '650 x 600 x 500 mm',
        spindle_speed: '20,000 RPM (Haimer HSK-A63)',
        accuracy: 'Linear positioning ±0.003 mm',
        probing_system: 'Renishaw OMP60 optical probe with laser tool setting',
      },
      location: 'Hangar Sector',
      building: 'AeroGrid Precision Engineering (Fictional)',
      room: 'Machining Cell B',
      hourly_rate: 175,
      deposit: 800,
      turnaround_buffer_mins: 45,
      owner_id: 'user-owner-aris',
      status: 'available',
      condition_rating: 'good',
      serial_number: 'SN-H5X-3012',
      passport_id: 'IXP-CNC5-006',
      image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      created_at: new Date(now - 65 * dayMs).toISOString(),
    },
    {
      id: 'res-optical-profilometer',
      title: 'Non-Contact 3D Optical Surface Profilometer',
      slug: 'non-contact-3d-optical-surface-profilometer',
      category: 'equipment',
      subcategory: 'Metrology & Inspection',
      description: 'Coherence-scanning white light interferometer providing sub-nanometer vertical step height resolution for micro-fluidic channels, polished optics, and MEMS structures.',
      specifications: {
        vertical_resolution: '< 0.1 nm (Phase Shifting Interferometry)',
        lateral_resolution: '0.35 µm',
        field_of_view: '0.14 to 7.0 mm (with automated stitching)',
        measurement_types: ['Surface Roughness (Sa, Sq)', 'Step Height', 'Thin Film Topography'],
      },
      location: 'Tech District',
      building: 'Vanguard Metrology Core (Fictional)',
      room: 'Precision Lab 3',
      hourly_rate: 130,
      deposit: 500,
      turnaround_buffer_mins: 30,
      owner_id: 'user-owner-elena',
      status: 'available',
      condition_rating: 'pristine',
      serial_number: 'SN-WLI-508',
      passport_id: 'IXP-OPTI-007',
      image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
      created_at: new Date(now - 70 * dayMs).toISOString(),
    },
    {
      id: 'res-keysight-33ghz',
      title: 'Keysight 33 GHz Real-Time Oscilloscope & RF Bench',
      slug: 'keysight-uxr-33ghz-rf-bench',
      category: 'equipment',
      subcategory: 'RF & Signal Metrology',
      description: 'Ultra-low noise real-time instrument delivering 128 GSa/s simultaneous sampling across 4 channels with 10-bit analog-to-digital resolution for high-frequency signal integrity validation.',
      specifications: {
        analog_bandwidth: '33 GHz on 4 channels',
        sample_rate: '128 GSa/s per channel',
        adc_resolution: '10-bit high-definition ADC architecture',
        intrinsic_jitter: '< 25 fs rms',
      },
      location: 'East Engineering Wing',
      building: 'Kinetics Signal Dynamics (Fictional)',
      room: 'RF Lab 310',
      hourly_rate: 140,
      deposit: 600,
      turnaround_buffer_mins: 30,
      owner_id: 'user-owner-aris',
      status: 'available',
      condition_rating: 'pristine',
      serial_number: 'SN-KS-33G-11',
      passport_id: 'IXP-OSC3-008',
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      created_at: new Date(now - 50 * dayMs).toISOString(),
    },

    // --- DIGITAL & TECH ---
    {
      id: 'res-nvidia-h100',
      title: 'Dedicated 8x NVIDIA H100 SXM5 Compute Instance',
      slug: 'dedicated-8x-nvidia-h100-sxm5-compute-instance',
      category: 'digital',
      subcategory: 'High Performance Compute',
      description: 'Dedicated GPU node featuring 8x NVIDIA H100 80GB SXM5 GPUs interconnected via NVLink 4 (900 GB/s), 2.0 TB DDR5 memory, and 3.2 Tbps InfiniBand cluster fabric.',
      specifications: {
        accelerators: '8x NVIDIA H100 80GB SXM5 (Transformer Engine FP8)',
        interconnect: 'NVLink 4 + 400 Gbps OSFP Quantum-2 InfiniBand',
        system_memory: '2.0 TB DDR5 4800 MHz ECC',
        local_scratch: '30 TB NVMe PCIe Gen5 high-throughput storage',
      },
      location: 'North Research Sector',
      building: 'Vanguard Compute Collective (Fictional)',
      room: 'Cluster Node Rack B12',
      hourly_rate: 85,
      deposit: 0,
      turnaround_buffer_mins: 15,
      owner_id: 'user-owner-elena',
      status: 'available',
      condition_rating: 'pristine',
      serial_number: 'DIG-H100-NODE4',
      passport_id: 'IXP-H100-009',
      image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80',
      created_at: new Date(now - 95 * dayMs).toISOString(),
    },
    {
      id: 'res-sim-cluster',
      title: 'Parallel Multi-Physics & CFD Compute Allocation',
      slug: 'parallel-multi-physics-cfd-compute-allocation',
      category: 'digital',
      subcategory: 'Scientific Simulation',
      description: 'Dedicated 128-core high-throughput parallel compute partition configured with OpenFOAM, Ansys Fluent, and pre-compiled MPI solvers with priority Slurm scheduling.',
      specifications: {
        cpu_cores: '128-core AMD EPYC 9654 processors',
        host_ram: '512 GB DDR5 ECC',
        mpi_stack: 'OpenMPI 5.0 with UCX InfiniBand acceleration',
        parallel_io: 'Lustre parallel scratch storage partition',
      },
      location: 'Hangar Sector',
      building: 'AeroGrid Simulation Core (Fictional)',
      room: 'Cluster Node Rack C-11',
      hourly_rate: 55,
      deposit: 0,
      turnaround_buffer_mins: 15,
      owner_id: 'user-owner-aris',
      status: 'available',
      condition_rating: 'pristine',
      serial_number: 'DIG-CFD-NODE1',
      passport_id: 'IXP-CFD1-010',
      image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      created_at: new Date(now - 85 * dayMs).toISOString(),
    },
    {
      id: 'res-ml-pipeline',
      title: 'Distributed Machine Learning Development Node',
      slug: 'distributed-machine-learning-development-node',
      category: 'digital',
      subcategory: 'Machine Learning',
      description: 'Containerized multi-GPU training environment with 4x NVIDIA RTX 6000 Ada Generation (48GB VRAM each), JupyterLab integration, and pre-configured PyTorch 2.3.',
      specifications: {
        accelerators: '4x NVIDIA RTX 6000 Ada (192GB aggregate VRAM)',
        system_memory: '256 GB DDR5',
        environment: 'Docker / PyTorch 2.3 / vLLM / HuggingFace Transformers',
        remote_access: 'SSH keypair + JupyterLab token authentication',
      },
      location: 'Central Campus',
      building: 'Kinetics Deep Learning Lab (Fictional)',
      room: 'Edge Node 03',
      hourly_rate: 45,
      deposit: 0,
      turnaround_buffer_mins: 10,
      owner_id: 'user-owner-aris',
      status: 'available',
      condition_rating: 'pristine',
      serial_number: 'DIG-ML-NODE3',
      passport_id: 'IXP-MLN3-011',
      image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      created_at: new Date(now - 60 * dayMs).toISOString(),
    },
  ];

  // 5. Resource Skills
  const resourceSkills = [
    { id: 'rsk-1', resource_id: 'res-stratasys-450mc', skill_id: 'skill-fdm', is_mandatory: 1 },
    { id: 'rsk-2', resource_id: 'res-markforged-x7', skill_id: 'skill-fdm', is_mandatory: 1 },
    { id: 'rsk-3', resource_id: 'res-cnc-5axis', skill_id: 'skill-machining', is_mandatory: 1 },
    { id: 'rsk-4', resource_id: 'res-cleanroom-alpha', skill_id: 'skill-cleanroom', is_mandatory: 1 },
    { id: 'rsk-5', resource_id: 'res-nvidia-h100', skill_id: 'skill-hpc', is_mandatory: 1 },
  ];

  // 6. Bookings
  const bkg1Start = new Date(now - 2 * hourMs).toISOString();
  const bkg1End = new Date(now + 30 * minMs).toISOString();

  const bkg2Start = new Date(now + 60 * minMs).toISOString();
  const bkg2End = new Date(now + 3 * hourMs).toISOString();

  const bkg3Start = new Date(now - 28 * hourMs).toISOString();
  const bkg3End = new Date(now - 25 * hourMs).toISOString();

  const bkg4Start = new Date(now + 24 * hourMs).toISOString();
  const bkg4End = new Date(now + 28 * hourMs).toISOString();

  const bkg5Start = new Date(now + 18 * hourMs).toISOString();
  const bkg5End = new Date(now + 22 * hourMs).toISOString();

  const bookings: Booking[] = [
    {
      id: 'bkg-live-dev',
      resource_id: 'res-stratasys-450mc',
      user_id: 'user-dev',
      start_time: bkg1Start,
      end_time: bkg1End,
      scheduled_return_time: bkg1End,
      actual_return_time: null,
      status: 'in_progress',
      purpose: 'Rapid fabrication of lightweight titanium-reinforced bionic gripper linkages for Master Thesis defense.',
      total_cost: 275,
      delay_minutes: 0,
      created_at: new Date(now - 24 * hourMs).toISOString(),
      updated_at: bkg1Start,
    },
    {
      id: 'bkg-next-anya',
      resource_id: 'res-stratasys-450mc',
      user_id: 'user-anya',
      start_time: bkg2Start,
      end_time: bkg2End,
      scheduled_return_time: bkg2End,
      actual_return_time: null,
      status: 'confirmed',
      purpose: 'Biocompatible microfluidic manifold scaffold printing in medical-grade PC-ISO for cellular culture trials.',
      total_cost: 220,
      delay_minutes: 0,
      created_at: new Date(now - 12 * hourMs).toISOString(),
      updated_at: new Date(now - 12 * hourMs).toISOString(),
    },
    {
      id: 'bkg-past-drone',
      resource_id: 'res-prototyping-suite',
      user_id: 'user-dev',
      start_time: bkg3Start,
      end_time: bkg3End,
      scheduled_return_time: bkg3End,
      actual_return_time: bkg3End,
      status: 'returned',
      purpose: 'Precision SMD reflow soldering and wire bonding of custom brushless motor controller flight boards.',
      total_cost: 195,
      delay_minutes: 0,
      created_at: new Date(now - 48 * hourMs).toISOString(),
      updated_at: bkg3End,
    },
    {
      id: 'bkg-pending-kabir',
      resource_id: 'res-keysight-33ghz',
      user_id: 'user-kabir',
      start_time: bkg4Start,
      end_time: bkg4End,
      scheduled_return_time: bkg4End,
      actual_return_time: null,
      status: 'pending',
      purpose: 'S-parameter measurement and noise figure characterization of Ka-band radar patch antenna array.',
      total_cost: 560,
      delay_minutes: 0,
      created_at: new Date(now - 4 * hourMs).toISOString(),
      updated_at: new Date(now - 4 * hourMs).toISOString(),
    },
    {
      id: 'bkg-cleanroom-anya',
      resource_id: 'res-cleanroom-alpha',
      user_id: 'user-anya',
      start_time: bkg5Start,
      end_time: bkg5End,
      scheduled_return_time: bkg5End,
      actual_return_time: null,
      status: 'confirmed',
      purpose: 'Photolithography pattern transfer and spin coating of SU-8 photoresist on 4-inch silicon substrate.',
      total_cost: 560,
      delay_minutes: 0,
      created_at: new Date(now - 18 * hourMs).toISOString(),
      updated_at: new Date(now - 18 * hourMs).toISOString(),
    },
  ];

  // 7. FairShare Waitlist
  const waitlist: WaitlistEntry[] = [
    {
      id: 'wl-1',
      resource_id: 'res-stratasys-450mc',
      user_id: 'user-kabir',
      requested_start: bkg2Start,
      requested_end: bkg2End,
      priority_score: 68,
      queue_position: 1,
      status: 'waiting',
      notes: 'Requested slot overlaps with confirmed booking bkg-next-anya. Position 1 assigned based on Academic Priority score.',
      created_at: new Date(now - 6 * hourMs).toISOString(),
    },
  ];

  // 8. Condition Reports
  const conditionReports: ConditionReport[] = [
    {
      id: 'rep-dev-checkout',
      booking_id: 'bkg-live-dev',
      resource_id: 'res-stratasys-450mc',
      report_type: 'checkout',
      condition_rating: 'pristine',
      checklist: {
        bed_leveled: true,
        nozzle_purged: true,
        chamber_clean: true,
        material_loaded: 'ULTEM 9085 Natural Spool 84%',
        safety_interlocks_active: true,
      },
      discrepancies: null,
      photo_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80',
      reported_by: 'user-dev',
      timestamp: bkg1Start,
    },
    {
      id: 'rep-proto-checkout',
      booking_id: 'bkg-past-drone',
      resource_id: 'res-prototyping-suite',
      report_type: 'checkout',
      condition_rating: 'pristine',
      checklist: {
        esd_grounding_verified: true,
        soldering_station_clean: true,
        microscopes_calibrated: true,
        fume_extraction_active: true,
      },
      discrepancies: null,
      photo_url: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400&auto=format&fit=crop&q=80',
      reported_by: 'user-dev',
      timestamp: bkg3Start,
    },
    {
      id: 'rep-proto-return',
      booking_id: 'bkg-past-drone',
      resource_id: 'res-prototyping-suite',
      report_type: 'return',
      condition_rating: 'pristine',
      checklist: {
        esd_grounding_verified: true,
        soldering_station_clean: true,
        microscopes_calibrated: true,
        fume_extraction_active: true,
      },
      discrepancies: 'Zero damage observed. Workstation tidied, soldering tips tinned, nitrogen valve closed.',
      photo_url: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400&auto=format&fit=crop&q=80',
      reported_by: 'user-dev',
      timestamp: bkg3End,
    },
  ];

  // 9. Maintenance Records
  const maintenanceRecords: MaintenanceRecord[] = [
    {
      id: 'maint-1',
      resource_id: 'res-stratasys-450mc',
      technician_id: 'user-owner-aris',
      maintenance_type: 'calibration',
      description: 'Quarterly thermal chamber re-calibration and T16 tip liquefier replacement. Verified extrusion flow rate with 0.1mm test coupon.',
      parts_replaced: 'T16 Hardened Tip, Vacuum Platen Seal Ring',
      cost: 450,
      timestamp: new Date(now - 14 * dayMs).toISOString(),
      status: 'completed',
    },
    {
      id: 'maint-2',
      resource_id: 'res-cnc-5axis',
      technician_id: 'user-owner-aris',
      maintenance_type: 'routine_inspection',
      description: 'Laser tool setter calibration, spindle runout inspection (< 1.5 µm measured), and way-lube filter replacement.',
      parts_replaced: 'Way Lube Filter Cartridge, Spindle Air Purge Seal',
      cost: 620,
      timestamp: new Date(now - 25 * dayMs).toISOString(),
      status: 'completed',
    },
  ];

  // 10. Disruptions
  const disruptions: DisruptionEvent[] = [
    {
      id: 'disrupt-init-01',
      delayed_booking_id: 'bkg-live-dev',
      affected_booking_id: 'bkg-next-anya',
      buffer_minutes: 30,
      delay_duration_minutes: 45,
      risk_level: 'critical',
      suggested_alternative_resource_id: 'res-markforged-x7',
      resolution_action: null,
      resolved_at: null,
      resolved_by: null,
      notes: 'Upstream job on Stratasys Fortus 450mc running 45m late. Downstream booking for Anya Sharma at risk.',
      created_at: new Date(now - 10 * minMs).toISOString(),
    },
  ];

  // 11. Notifications
  const notifications: Notification[] = [
    {
      id: 'notif-1',
      user_id: 'user-dev',
      title: 'Active Session Milestone',
      message: 'Your reservation on Stratasys Fortus 450mc has reached 80% duration. Scheduled return is at ' + new Date(bkg1End).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '.',
      type: 'info',
      link: '/bookings/bkg-live-dev',
      read_status: 0,
      created_at: new Date(now - 15 * minMs).toISOString(),
    },
    {
      id: 'notif-2',
      user_id: 'user-owner-aris',
      title: 'Pending Booking Request',
      message: 'Kabir Mehta submitted a reservation request for Keysight 33 GHz RF Bench for review.',
      type: 'warning',
      link: '/owner/requests',
      read_status: 0,
      created_at: new Date(now - 4 * hourMs).toISOString(),
    },
  ];

  // 12. Audit Events
  const auditEvents: AuditEvent[] = [
    {
      id: 'aud-1',
      entity_type: 'booking',
      entity_id: 'bkg-live-dev',
      action: 'CHECKOUT_VERIFIED',
      actor_id: 'user-dev',
      payload: { condition_score: 'pristine', verified_checklist_items: 5 },
      created_at: bkg1Start,
    },
    {
      id: 'aud-2',
      entity_type: 'booking',
      entity_id: 'bkg-next-anya',
      action: 'RESERVATION_CONFIRMED',
      actor_id: 'user-owner-aris',
      payload: { auto_confirmed: true, verified_skill_checked: 'Stratasys FDM Industrial Operator' },
      created_at: new Date(now - 12 * hourMs).toISOString(),
    },
  ];

  return {
    users,
    skills,
    userSkills,
    resources,
    resourceSkills,
    bookings,
    waitlist,
    conditionReports,
    maintenanceRecords,
    disruptions,
    notifications,
    auditEvents,
  };
}
