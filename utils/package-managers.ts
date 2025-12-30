// Python 包管理工具配置
export interface PackageManager {
  id: string;
  name: string;
  addCommand: (packageName: string, version?: string) => string;
}

type VersionOperator = '==' | '=' | '@';

function formatPackageRequirement(packageName: string, version: string | undefined, operator: VersionOperator): string {
  const normalizedVersion = version?.trim();
  if (!normalizedVersion) return packageName;

  if (operator === '@') {
    return `${packageName}@${normalizedVersion}`;
  }

  return `${packageName}${operator}${normalizedVersion}`;
}

export const packageManagers: PackageManager[] = [
  {
    id: 'pip',
    name: 'pip',
    addCommand: (pkg, version) => `pip install ${formatPackageRequirement(pkg, version, '==')}`,
  },
  {
    id: 'uv',
    name: 'uv',
    addCommand: (pkg, version) => `uv add ${formatPackageRequirement(pkg, version, '==')}`,
  },
  {
    id: 'poetry',
    name: 'Poetry',
    addCommand: (pkg, version) => `poetry add ${formatPackageRequirement(pkg, version, '@')}`,
  },
  {
    id: 'pipenv',
    name: 'Pipenv',
    addCommand: (pkg, version) => `pipenv install ${formatPackageRequirement(pkg, version, '==')}`,
  },
  {
    id: 'conda',
    name: 'Conda',
    addCommand: (pkg, version) => `conda install ${formatPackageRequirement(pkg, version, '=')}`,
  },
  {
    id: 'pdm',
    name: 'PDM',
    addCommand: (pkg, version) => `pdm add ${formatPackageRequirement(pkg, version, '==')}`,
  },
  {
    id: 'rye',
    name: 'Rye',
    addCommand: (pkg, version) => `rye add ${formatPackageRequirement(pkg, version, '==')}`,
  },
  {
    id: 'hatch',
    name: 'Hatch',
    addCommand: (pkg, version) => `hatch add ${formatPackageRequirement(pkg, version, '==')}`,
  },
];

export const getPackageManager = (id: string): PackageManager | undefined => {
  return packageManagers.find((pm) => pm.id === id);
};
