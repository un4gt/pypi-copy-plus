// Python 包管理工具配置
export interface PackageManager {
  id: string;
  name: string;
  addCommand: (packageName: string) => string;
}

export const packageManagers: PackageManager[] = [
  {
    id: 'pip',
    name: 'pip',
    addCommand: (pkg) => `pip install ${pkg}`,
  },
  {
    id: 'uv',
    name: 'uv',
    addCommand: (pkg) => `uv add ${pkg}`,
  },
  {
    id: 'poetry',
    name: 'Poetry',
    addCommand: (pkg) => `poetry add ${pkg}`,
  },
  {
    id: 'pipenv',
    name: 'Pipenv',
    addCommand: (pkg) => `pipenv install ${pkg}`,
  },
  {
    id: 'conda',
    name: 'Conda',
    addCommand: (pkg) => `conda install ${pkg}`,
  },
  {
    id: 'pdm',
    name: 'PDM',
    addCommand: (pkg) => `pdm add ${pkg}`,
  },
  {
    id: 'rye',
    name: 'Rye',
    addCommand: (pkg) => `rye add ${pkg}`,
  },
  {
    id: 'hatch',
    name: 'Hatch',
    addCommand: (pkg) => `hatch add ${pkg}`,
  },
];

export const getPackageManager = (id: string): PackageManager | undefined => {
  return packageManagers.find((pm) => pm.id === id);
};
