import React, { useState } from 'react';
import { 
  Button, Input, Select, Checkbox, Radio, Tabs, TabsList, TabsTrigger, TabsContent,
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Dropdown, Modal, Drawer, Tooltip, Badge, Pagination, LoadingSpinner,
  EmptyState, ErrorState, Skeleton, SkeletonCard, SkeletonTable
} from './index';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Compass, Droplets, Thermometer, Layers, AlertCircle, CheckCircle, 
  HelpCircle, Eye, Settings, Sparkles, X, Globe, BarChart2 
} from 'lucide-react';

export const DesignSystemShowcase: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('buttons');
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [inputValue, setInputValue] = useState('Argo Float 1902670');
  const [selectValue, setSelectValue] = useState('temp');
  const [checkboxState, setCheckboxState] = useState(true);
  const [radioState, setRadioState] = useState('opt1');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1500] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Showcase Header */}
        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-[var(--text-primary)]">
                  SIH2026 Scientific Design System Catalog
                </h2>
                <Badge variant="primary">Phase 1 Acceptance</Badge>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Testing all UI tokens, atomic components, and accessibility in {theme.toUpperCase()} mode.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              leftIcon={<Globe className="w-3.5 h-3.5 text-[var(--primary)]" />}
            >
              Mode: <span className="font-semibold uppercase ml-1">{theme}</span>
            </Button>
            <Button variant="ghost" size="sm" iconOnly onClick={onClose} aria-label="Close catalog">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Showcase Body */}
        <div className="flex-1 overflow-hidden flex flex-col p-4 bg-[var(--bg-app)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="bg-[var(--bg-surface)] rounded-md p-1 border border-[var(--border)]">
              <TabsTrigger value="buttons">Buttons & Actions</TabsTrigger>
              <TabsTrigger value="forms">Inputs & Controls</TabsTrigger>
              <TabsTrigger value="cards">Cards & Badges</TabsTrigger>
              <TabsTrigger value="tables">Scientific Tables</TabsTrigger>
              <TabsTrigger value="overlays">Modals & Drawers</TabsTrigger>
              <TabsTrigger value="feedback">Toasts & States</TabsTrigger>
              <TabsTrigger value="skeletons">Skeletons & Loaders</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4 p-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)]">
              {/* Tab 1: Buttons */}
              <TabsContent value="buttons" className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                    Button Variants
                  </h3>
                  <div className="flex flex-wrap gap-3 items-center">
                    <Button variant="primary">Primary Action</Button>
                    <Button variant="secondary">Secondary Action</Button>
                    <Button variant="outline">Outline Button</Button>
                    <Button variant="ghost">Ghost Button</Button>
                    <Button variant="danger">Danger Action</Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                    Button Sizes & States
                  </h3>
                  <div className="flex flex-wrap gap-3 items-center">
                    <Button size="sm" variant="primary">Small (28px)</Button>
                    <Button size="md" variant="primary">Medium (34px)</Button>
                    <Button size="lg" variant="primary">Large (40px)</Button>
                    <Button variant="primary" isLoading>Loading State</Button>
                    <Button variant="outline" disabled>Disabled State</Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                    Icon Buttons & Tooltips
                  </h3>
                  <div className="flex flex-wrap gap-3 items-center">
                    <Tooltip content="Compass Orientation & North Align">
                      <Button variant="outline" iconOnly aria-label="Compass">
                        <Compass className="w-4 h-4 text-[var(--primary)]" />
                      </Button>
                    </Tooltip>

                    <Tooltip content="Ocean Temperature (°C) Profile">
                      <Button variant="outline" leftIcon={<Thermometer className="w-4 h-4 text-rose-500" />}>
                        Temperature
                      </Button>
                    </Tooltip>

                    <Dropdown
                      trigger={
                        <Button variant="outline" rightIcon={<Eye className="w-3.5 h-3.5" />}>
                          Layer Views
                        </Button>
                      }
                      items={[
                        { id: '1', label: 'Bathymetry (GEBCO)', onClick: () => toast.info('Bathymetry selected') },
                        { id: '2', label: 'Sea Surface Salinity', onClick: () => toast.info('SSS layer selected') },
                        { id: '3', label: 'Clear Active Layers', danger: true, onClick: () => toast.warning('Cleared layers') },
                      ]}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Inputs & Controls */}
              <TabsContent value="forms" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Search Geographic Point / Platform ID"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onClear={() => setInputValue('')}
                    helperText="Type coordinate (lat, lon) or 7-digit WMO float number."
                  />

                  <Select
                    label="Target Oceanographic Variable"
                    value={selectValue}
                    onChange={(e) => setSelectValue(e.target.value)}
                    options={[
                      { value: 'temp', label: 'In-situ Temperature (°C)' },
                      { value: 'psal', label: 'Practical Salinity (PSAL)' },
                      { value: 'pres', label: 'Sea Water Pressure / Depth (dbar)' },
                      { value: 'doxy', label: 'Dissolved Oxygen (μmol/kg)' },
                    ]}
                    helperText="Scientific variable for color-coding 3D observations."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[var(--border-subtle)]">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                      Checkboxes
                    </h4>
                    <div className="space-y-2">
                      <Checkbox
                        label="Quality Control (QC Flag = 1)"
                        description="Only display verified sensor readings passed by ocean data center."
                        checked={checkboxState}
                        onChange={(e) => setCheckboxState(e.target.checked)}
                        badge={<Badge variant="success">QC PASSED</Badge>}
                      />
                      <Checkbox
                        label="Include Real-Time Glider Telemetry"
                        description="Include underwater autonomous glider transects."
                        defaultChecked={false}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                      Radio Selections
                    </h4>
                    <div className="space-y-2">
                      <Radio
                        name="model_choice"
                        label="HYCOM (Hybrid Coordinate Ocean Model)"
                        description="1/12° global resolution with 32 vertical coordinate surfaces."
                        checked={radioState === 'opt1'}
                        onChange={() => setRadioState('opt1')}
                      />
                      <Radio
                        name="model_choice"
                        label="ROMS (Regional Ocean Modeling System)"
                        description="Terrain-following free-surface hydrostatic model."
                        checked={radioState === 'opt2'}
                        onChange={() => setRadioState('opt2')}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 3: Cards & Badges */}
              <TabsContent value="cards" className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                    Status Badges
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="neutral">NEUTRAL</Badge>
                    <Badge variant="primary" dot>ACTIVE DATASET</Badge>
                    <Badge variant="success" dot>INCOIS ERDDAP ONLINE</Badge>
                    <Badge variant="warning" dot>QC DELAYED</Badge>
                    <Badge variant="error" dot>SENSOR DRIFT ERROR</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Argo Float #2902224</CardTitle>
                      <Badge variant="success">Active</Badge>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Apex float deployed in Southern Indian Ocean, Cycle #252.
                      </CardDescription>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                        <div className="p-2 bg-[var(--bg-surface-secondary)] rounded">
                          <span className="text-[var(--text-muted)] block">Temperature</span>
                          <span className="font-mono font-bold text-sm text-[var(--text-primary)]">27.50 °C</span>
                        </div>
                        <div className="p-2 bg-[var(--bg-surface-secondary)] rounded">
                          <span className="text-[var(--text-muted)] block">Salinity</span>
                          <span className="font-mono font-bold text-sm text-[var(--text-primary)]">34.80 PSU</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm">Inspect Trajectory</Button>
                      <Button variant="primary" size="sm">View Depth Profile</Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>HYCOM Global 1/12° Model</CardTitle>
                      <Badge variant="primary">Model Source</Badge>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Reanalysis dataset for Bay of Bengal & Arabian Sea basin.
                      </CardDescription>
                      <div className="space-y-1 mt-3 text-xs text-[var(--text-secondary)]">
                        <div>Spatial Coverage: <span className="font-mono text-[var(--text-primary)]">30°E – 120°E</span></div>
                        <div>Vertical Levels: <span className="font-mono text-[var(--text-primary)]">40 Standard Depths</span></div>
                        <div>Temporal Step: <span className="font-mono text-[var(--text-primary)]">3-Hourly Averages</span></div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="secondary" size="sm">Compare With In-Situ</Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab 4: Tables */}
              <TabsContent value="tables" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Indian Ocean Hydrographic Observations
                  </h4>
                  <Badge variant="neutral">Total 4 Records Shown</Badge>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform ID</TableHead>
                      <TableHead>Cycle</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Latitude</TableHead>
                      <TableHead>Longitude</TableHead>
                      <TableHead>Depth (m)</TableHead>
                      <TableHead>Temp (°C)</TableHead>
                      <TableHead>Salinity (PSU)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono font-semibold text-[var(--primary)]">1902670</TableCell>
                      <TableCell isNumeric>11</TableCell>
                      <TableCell>2024-01-04 14:00Z</TableCell>
                      <TableCell isNumeric>4.833° N</TableCell>
                      <TableCell isNumeric>88.900° E</TableCell>
                      <TableCell isNumeric>5.0</TableCell>
                      <TableCell isNumeric className="text-rose-600 dark:text-rose-400 font-semibold">28.92</TableCell>
                      <TableCell isNumeric className="text-teal-600 dark:text-teal-400 font-semibold">33.18</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono font-semibold text-[var(--primary)]">2902224</TableCell>
                      <TableCell isNumeric>252</TableCell>
                      <TableCell>2024-01-02 19:21Z</TableCell>
                      <TableCell isNumeric>-12.450° S</TableCell>
                      <TableCell isNumeric>75.320° E</TableCell>
                      <TableCell isNumeric>99.3</TableCell>
                      <TableCell isNumeric className="text-rose-600 dark:text-rose-400 font-semibold">22.10</TableCell>
                      <TableCell isNumeric className="text-teal-600 dark:text-teal-400 font-semibold">35.05</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono font-semibold text-[var(--primary)]">7902190</TableCell>
                      <TableCell isNumeric>4</TableCell>
                      <TableCell>2024-06-03 20:36Z</TableCell>
                      <TableCell isNumeric>17.475° N</TableCell>
                      <TableCell isNumeric>88.281° E</TableCell>
                      <TableCell isNumeric>79.4</TableCell>
                      <TableCell isNumeric className="text-rose-600 dark:text-rose-400 font-semibold">26.40</TableCell>
                      <TableCell isNumeric className="text-teal-600 dark:text-teal-400 font-semibold">34.15</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono font-semibold text-[var(--primary)]">5906211</TableCell>
                      <TableCell isNumeric>8</TableCell>
                      <TableCell>2024-01-06 08:45Z</TableCell>
                      <TableCell isNumeric>-5.200° S</TableCell>
                      <TableCell isNumeric>92.150° E</TableCell>
                      <TableCell isNumeric>297.8</TableCell>
                      <TableCell isNumeric className="text-rose-600 dark:text-rose-400 font-semibold">11.20</TableCell>
                      <TableCell isNumeric className="text-teal-600 dark:text-teal-400 font-semibold">34.95</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <Pagination
                  currentPage={currentPage}
                  totalPages={8}
                  totalRecords={32}
                  pageSize={4}
                  onPageChange={setCurrentPage}
                />
              </TabsContent>

              {/* Tab 5: Overlays */}
              <TabsContent value="overlays" className="space-y-4">
                <div className="flex gap-3">
                  <Button variant="primary" onClick={() => setModalOpen(true)}>
                    Trigger Scientific Modal
                  </Button>
                  <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
                    Trigger Observation Drawer
                  </Button>
                </div>

                <Modal
                  isOpen={modalOpen}
                  onClose={() => setModalOpen(false)}
                  title="Configure Statistical Error Metric Calculation"
                  description="Specify validation parameters between HYCOM model and Indian Argo profiles."
                  footer={
                    <>
                      <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setModalOpen(false);
                          toast.success('Statistical validation pipeline initiated');
                        }}
                      >
                        Compute Metrics
                      </Button>
                    </>
                  }
                >
                  <div className="space-y-3 text-xs">
                    <p className="text-[var(--text-secondary)]">
                      The comparison engine interpolates the 3D model grid to the exact spatial, temporal, and depth coordinates of the selected Argo profiles.
                    </p>
                    <div className="p-3 bg-[var(--bg-surface-secondary)] rounded border border-[var(--border)]">
                      <span className="font-semibold block text-[var(--text-primary)]">Calculated Metrics:</span>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-[var(--text-muted)]">
                        <li>Mean Bias Error (MBE)</li>
                        <li>Root Mean Square Error (RMSE)</li>
                        <li>Pearson Correlation Coefficient (R)</li>
                        <li>Determination Coefficient (R²)</li>
                      </ul>
                    </div>
                  </div>
                </Modal>

                <Drawer
                  isOpen={drawerOpen}
                  onClose={() => setDrawerOpen(false)}
                  title="Observation Profile #1902670"
                  subtitle="Detailed Hydrographic Sensors"
                  footer={
                    <Button variant="outline" size="sm" onClick={() => setDrawerOpen(false)}>
                      Close Drawer
                    </Button>
                  }
                >
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-[var(--primary-subtle)] border border-[var(--primary)]/30 rounded">
                      <span className="font-bold text-[var(--primary)] block">INCOIS Certified Profile</span>
                      <span className="text-[var(--text-secondary)]">Cycle #11 in Northern Bay of Bengal</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                        <span className="text-[var(--text-muted)]">Platform Number</span>
                        <span className="font-mono font-semibold text-[var(--text-primary)]">1902670</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                        <span className="text-[var(--text-muted)]">Location</span>
                        <span className="font-mono font-semibold text-[var(--text-primary)]">4.833° N, 88.900° E</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                        <span className="text-[var(--text-muted)]">Maximum Depth</span>
                        <span className="font-mono font-semibold text-[var(--text-primary)]">198.5 m</span>
                      </div>
                    </div>
                  </div>
                </Drawer>
              </TabsContent>

              {/* Tab 6: Feedback & Toasts */}
              <TabsContent value="feedback" className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                    Trigger Toast Notifications
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success('Dataset Loaded', 'Successfully filtered 42 Argo floats in Indian Ocean.')}
                    >
                      Trigger Success Toast
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.warning('High Latency Warning', 'INCOIS ERDDAP responding slowly (>1500ms).')}
                    >
                      Trigger Warning Toast
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.error('Query Error', 'Bounding box coordinates outside valid marine boundaries.')}
                    >
                      Trigger Error Toast
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info('HYCOM Model Subsetting', 'Extracting slice at 100m depth level.')}
                    >
                      Trigger Info Toast
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EmptyState
                    title="No Ocean Observations Found"
                    description="Adjust date range or expand the spatial bounding box to retrieve available in-situ data."
                    actionLabel="Reset Explorer Filters"
                    onAction={() => toast.info('Filters reset')}
                  />

                  <ErrorState
                    title="ERDDAP Endpoint Unavailable"
                    message="The external ocean data gateway failed to respond within 30 seconds. Click retry to query secondary proxy."
                    onRetry={() => toast.info('Retrying connection...')}
                  />
                </div>
              </TabsContent>

              {/* Tab 7: Skeletons & Loaders */}
              <TabsContent value="skeletons" className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                    Loading Spinner Indicators
                  </h4>
                  <div className="flex items-center gap-8 p-4 bg-[var(--bg-surface-secondary)] rounded">
                    <LoadingSpinner size="sm" text="Small Spinner" />
                    <LoadingSpinner size="md" text="Standard Spinner" />
                    <LoadingSpinner size="lg" text="Large Model Loader" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-[var(--text-muted)]">Card Skeleton</h5>
                    <SkeletonCard />
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-[var(--text-muted)]">Table Skeleton</h5>
                    <SkeletonTable rows={3} />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Showcase Footer */}
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>SIH2026 Ocean Platform Phase 1 • Strict Light & Dark Design Tokens</span>
          <Button variant="primary" size="sm" onClick={onClose}>
            Close Design System Showcase
          </Button>
        </div>
      </div>
    </div>
  );
};
