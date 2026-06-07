import {
  PrismaClient,
  Role,
  VMStatus,
  Platform,
  Criticality,
  Environment,
  PowerState,
  NotificationType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEPARTMENTS = [
  "Engineering",
  "Operations",
  "Finance",
  "HR",
  "Marketing",
  "Sales",
  "IT Infrastructure",
  "Security",
  "Data Analytics",
  "Customer Support",
];

const OS_TYPES = [
  { type: "Windows Server", versions: ["2019", "2022"] },
  { type: "Ubuntu", versions: ["20.04 LTS", "22.04 LTS", "24.04 LTS"] },
  { type: "RHEL", versions: ["8.9", "9.3"] },
  { type: "CentOS", versions: ["7.9", "Stream 9"] },
  { type: "Debian", versions: ["11", "12"] },
  { type: "SUSE Linux", versions: ["15 SP5"] },
];

const APPLICATIONS = [
  "ERP System",
  "CRM Platform",
  "Web Portal",
  "Database Server",
  "File Server",
  "Mail Server",
  "DNS Server",
  "Monitoring",
  "CI/CD Pipeline",
  "Analytics Engine",
  "API Gateway",
  "Load Balancer",
];

const LOCATIONS = [
  "US-East-1",
  "US-West-2",
  "EU-West-1",
  "EU-Central-1",
  "AP-Southeast-1",
  "On-Prem DC1",
  "On-Prem DC2",
];

const DATACENTERS = ["DC-East", "DC-West", "DC-EU", "DC-APAC", "Cloud-Primary"];
const CLUSTERS = ["Cluster-A", "Cluster-B", "Cluster-Prod", "Cluster-Dev", "Cluster-DR"];
const DISK_TYPES = ["Thin", "Thick"];
const BACKUP_TYPES = ["Full", "Incremental", "Differential", "Snapshot"];
const REMOTE_ACCESS = ["SSH", "RDP", "VPN", "Console", "Bastion"];
const COMPLIANCE_TAGS = ["PCI", "HIPAA", "SOX", "ISO27001"];
const USE_CASES = ["Production Workload", "Development", "Testing", "DR Replica", "Database", "Web Hosting"];
const PATCH_LEVELS = ["Current", "N-1", "N-2", "Outdated"];
const OWNERS = [
  "John Smith",
  "Jane Doe",
  "Mike Johnson",
  "Sarah Williams",
  "David Brown",
  "Emily Davis",
  "Chris Wilson",
  "Lisa Anderson",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.importJob.deleteMany();
  await prisma.vMDraft.deleteMany();
  await prisma.savedView.deleteMany();
  await prisma.virtualMachine.deleteMany();
  await prisma.user.deleteMany();

  const adminPasswordHash = await bcrypt.hash("Moore!*%it", 12);
  const defaultPasswordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Zamir Amiri",
      email: "zamir.amiri@ahg.local",
      password: adminPasswordHash,
      role: Role.ADMIN,
      department: "IT Infrastructure",
    },
  });

  const operator = await prisma.user.create({
    data: {
      name: "Operations User",
      email: "operator@ahg.local",
      password: defaultPasswordHash,
      role: Role.OPERATOR,
      department: "Operations",
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: "Read Only User",
      email: "viewer@ahg.local",
      password: defaultPasswordHash,
      role: Role.VIEWER,
      department: "Finance",
    },
  });

  console.log("✅ Created users");

  const platforms = Object.values(Platform);
  const environments = Object.values(Environment);
  const statuses = Object.values(VMStatus);
  const criticalities = Object.values(Criticality);
  const powerStates = Object.values(PowerState);

  const vms = [];
  for (let i = 1; i <= 100; i++) {
    const os = randomItem(OS_TYPES);
    const dept = randomItem(DEPARTMENTS);
    const platform = randomItem(platforms);
    const env = randomItem(environments);
    const status =
      i <= 70
        ? VMStatus.ACTIVE
        : i <= 80
          ? VMStatus.INACTIVE
          : i <= 90
            ? randomItem([VMStatus.MAINTENANCE, VMStatus.PENDING])
            : VMStatus.DECOMMISSIONED;

    const criticality =
      i <= 10
        ? Criticality.CRITICAL
        : i <= 30
          ? Criticality.HIGH
          : randomItem(criticalities);

    const backupEnabled = i > 85 ? false : Math.random() > 0.15;
    const monitoringEnabled = i > 90 ? false : Math.random() > 0.1;

    const createdDate = randomDate(new Date("2022-01-01"), new Date("2025-06-01"));

    vms.push({
      vmId: `VM-${String(i).padStart(5, "0")}`,
      hostname: `vm-${platform.toLowerCase()}-${String(i).padStart(3, "0")}.corp.local`,
      vmName: `${randomItem(APPLICATIONS).replace(/\s+/g, "-")}-${env}-${i}`,
      description: `Virtual machine for ${randomItem(APPLICATIONS)} in ${env} environment`,
      environment: env,
      platform,
      useCase: randomItem(USE_CASES),
      ipAddress: `10.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`,
      secondaryIp: Math.random() > 0.7 ? `172.${randomInt(16, 31)}.${randomInt(0, 255)}.${randomInt(1, 254)}` : null,
      tertiaryIp: Math.random() > 0.85 ? `192.168.${randomInt(0, 255)}.${randomInt(1, 254)}` : null,
      sshPort: randomItem([22, 2222]),
      rdpPort: Math.random() > 0.5 ? 3389 : null,
      remoteAccessMethod: randomItem(REMOTE_ACCESS),
      dnsRecords: `vm-${i}.corp.local`,
      vlan: `VLAN-${randomInt(10, 99)}`,
      firewallZone: randomItem(["DMZ", "Internal", "Restricted", "Public"]),
      osType: os.type,
      osVersion: randomItem(os.versions),
      kernelVersion: randomItem(["5.15.0", "6.1.0", "6.5.0", "5.4.0"]),
      installedServices: randomItem(["nginx, ssh", "apache, mysql", "docker, kubelet", "sshd, cron"]),
      cpuCores: randomItem([2, 4, 8, 16, 32]),
      memoryGB: randomItem([4, 8, 16, 32, 64, 128]),
      storageGB: randomItem([50, 100, 250, 500, 1000, 2000]),
      physicalHost: `host-${randomInt(1, 20)}.dc.local`,
      datacenter: randomItem(DATACENTERS),
      diskType: randomItem(DISK_TYPES),
      storageDatastore: randomItem(["datastore1", "datastore2", "vsan-datastore", "ceph-pool"]),
      haEnabled: Math.random() > 0.4,
      cluster: randomItem(CLUSTERS),
      backupPolicy: randomItem(["Daily", "Weekly", "Monthly", "Continuous"]),
      backupType: randomItem(BACKUP_TYPES),
      patchLevel: randomItem(PATCH_LEVELS),
      antivirusInstalled: Math.random() > 0.2,
      lastVulnerabilityScanDate: randomDate(createdDate, new Date()),
      cisStigHardening: Math.random() > 0.5,
      encryptionAtRest: Math.random() > 0.3,
      complianceTags: Math.random() > 0.6 ? [randomItem(COMPLIANCE_TAGS)] : [],
      owner: randomItem(OWNERS),
      department: dept,
      businessUnit: `${dept} BU`,
      application: randomItem(APPLICATIONS),
      criticality,
      status,
      powerState: status === VMStatus.ACTIVE ? PowerState.ON : randomItem(powerStates),
      backupEnabled,
      monitoringEnabled,
      patchGroup: randomItem(["Monthly", "Quarterly", "Critical-Only", "Auto-Patch"]),
      location: randomItem(LOCATIONS),
      resourcePool: `RP-${env}`,
      costCenter: `CC-${randomInt(1000, 9999)}`,
      tags: [env.toLowerCase(), platform.toLowerCase(), dept.toLowerCase().replace(/\s+/g, "-")],
      notes: Math.random() > 0.5 ? `Notes for VM ${i}: Standard configuration applied.` : null,
      createdBy: randomItem([admin.name, operator.name]),
      createdDate,
      lastPatchDate: randomDate(createdDate, new Date()),
      endOfLifeDate:
        i <= 5
          ? randomDate(new Date(), new Date("2026-03-01"))
          : Math.random() > 0.8
            ? randomDate(new Date("2026-01-01"), new Date("2028-12-31"))
            : null,
    });
  }

  await prisma.virtualMachine.createMany({ data: vms });
  console.log("✅ Created 100 virtual machines");

  await prisma.auditLog.createMany({
    data: [
      {
        action: "CREATE",
        entityType: "VirtualMachine",
        entityId: "seed",
        userId: admin.id,
        newValue: { message: "Seed data created" },
      },
      {
        action: "LOGIN",
        entityType: "User",
        entityId: admin.id,
        userId: admin.id,
      },
    ],
  });

  const notifications = [
    {
      type: NotificationType.EOL_WARNING,
      title: "VMs Nearing End of Life",
      description: "5 virtual machines are approaching their end-of-life date within 90 days.",
      userId: admin.id,
    },
    {
      type: NotificationType.BACKUP_MISSING,
      title: "Missing Backups Detected",
      description: "15 virtual machines do not have backup enabled.",
      userId: admin.id,
    },
    {
      type: NotificationType.MONITORING_MISSING,
      title: "Missing Monitoring",
      description: "10 virtual machines do not have monitoring enabled.",
      userId: operator.id,
    },
    {
      type: NotificationType.SYSTEM_ALERT,
      title: "System Initialized",
      description: "AHG has been initialized with seed data.",
      userId: admin.id,
    },
  ];

  await prisma.notification.createMany({ data: notifications });
  console.log("✅ Created notifications");

  await prisma.importJob.create({
    data: {
      fileName: "initial-import.csv",
      status: "COMPLETED",
      totalRecords: 100,
      successfulRecords: 100,
      failedRecords: 0,
      userId: operator.id,
      completedAt: new Date(),
    },
  });

  console.log("\n🎉 Seed completed!");
  console.log("\nDefault credentials:");
  console.log("  Admin:    zamir.amiri / Moore!*%it");
  console.log("  Operator: operator@ahg.local / Password123!");
  console.log("  Viewer:   viewer@ahg.local / Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
