import math
import numpy as np
from typing import Dict, Any, List, Optional

class ModelSubsetter:
    """
    Scientific Subsetting & Simulation Engine for Ocean Models:
    - HYCOM 1/12° (Hybrid Isopycnal-Sigma-Pressure coordinates, 40 levels)
    - ROMS 1/24° (Terrain-following S-coordinates, 32 levels)
    - NEMO 1/4° (Partial step z-star coordinates, 75 levels)
    
    Generates compact 2D horizontal slices, vector fields, 1D vertical depth profiles,
    and 2D vertical transect cross-sections for the Indian Ocean basin (40°E-105°E, 15°S-30°N).
    """

    STANDARD_DEPTHS_HYCOM = [
        0, 10, 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 
        600, 700, 800, 900, 1000, 1250, 1500, 1750, 2000, 2500, 3000, 4000, 5000
    ]

    STANDARD_DEPTHS_ROMS = [
        0, 5, 10, 20, 30, 40, 50, 60, 75, 90, 100, 120, 150, 180, 200, 250, 300, 400, 500, 700, 1000, 1500, 2000
    ]

    STANDARD_DEPTHS_NEMO = [
        0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 90, 100, 125, 150, 175, 200, 250, 300, 350, 400, 450, 500,
        600, 700, 800, 900, 1000, 1200, 1400, 1600, 1800, 2000, 2500, 3000, 4000, 5000, 6000
    ]

    @classmethod
    def get_depth_levels(cls, model_id: str) -> List[int]:
        if model_id == "hycom":
            return cls.STANDARD_DEPTHS_HYCOM
        elif model_id == "roms":
            return cls.STANDARD_DEPTHS_ROMS
        elif model_id == "nemo":
            return cls.STANDARD_DEPTHS_NEMO
        return cls.STANDARD_DEPTHS_HYCOM

    @classmethod
    def generate_horizontal_slice(
        cls,
        model_id: str,
        variable: str = "temperature",
        depth_m: float = 0.0,
        date_str: Optional[str] = None,
        bbox: Optional[List[float]] = None # [min_lat, min_lon, max_lat, max_lon]
    ) -> Dict[str, Any]:
        """
        Generates a 2D regular grid slice subsetted at specified depth for the Indian Ocean.
        Default bounding box covers the North & Central Indian Ocean (45°E–98°E, 0°N–25°N).
        """
        # Coordinate bounds
        if bbox and len(bbox) == 4:
            min_lat, min_lon, max_lat, max_lon = bbox
        else:
            min_lat, max_lat = 0.0, 24.0
            min_lon, max_lon = 50.0, 95.0

        # Step size based on model resolution
        if model_id == "roms":
            lat_step = 0.8
            lon_step = 0.8
        elif model_id == "hycom":
            lat_step = 1.0
            lon_step = 1.0
        else: # nemo
            lat_step = 1.2
            lon_step = 1.2

        lats = np.arange(min_lat, max_lat + 0.1, lat_step).round(2).tolist()
        lons = np.arange(min_lon, max_lon + 0.1, lon_step).round(2).tolist()

        n_lat = len(lats)
        n_lon = len(lons)

        var_clean = variable.lower()

        # Depth attenuation factor (exponential thermocline decay)
        depth_decay = math.exp(-depth_m / 400.0)
        deep_decay = math.exp(-depth_m / 1500.0)

        grid_values = []
        u_grid = []
        v_grid = []
        vectors = []

        min_val = 9999.0
        max_val = -9999.0

        for r, lat in enumerate(lats):
            row_vals = []
            u_row = []
            v_row = []
            for c, lon in enumerate(lons):
                # Oceanographic physical phenomena in Indian Ocean:
                # 1. Warm Pool (Eastern BoB / Equatorial)
                # 2. Arabian Sea High Salinity & Upwelling cooling along Oman/Somalia
                # 3. Bay of Bengal River runoff freshening (low salinity at north BoB)
                # 4. Wyrtki Jets at 0°N-3°N (strong eastward zonal velocity)
                # 5. Somali Current western boundary jet

                # Geographical land mask approximation (India subcontinent rough mask)
                is_land = (lat > 8.0 and lat < 22.0 and lon > 72.0 and lon < 85.0 and not (lat < 16.0 and lon > 80.0))
                # Arabia / Middle East
                if (lat > 14.0 and lon < 58.0) or (lat > 23.0 and lon < 68.0):
                    is_land = True
                # Myanmar / Indochina
                if (lat > 10.0 and lon > 98.0) or (lat > 18.0 and lon > 92.0):
                    is_land = True

                if is_land:
                    val = None
                    u_val = None
                    v_val = None
                else:
                    if var_clean in ["temperature", "temp", "sst"]:
                        # Surface baseline: ~28.5°C
                        # North BoB ~ 29.5°C, West Arabian Sea upwelling ~ 25.5°C
                        upwelling_cooling = 3.5 * math.exp(-((lon - 54.0)**2 + (lat - 12.0)**2) / 60.0)
                        lat_gradient = -0.08 * (lat - 5.0)
                        bob_warmth = 0.8 * math.exp(-((lon - 88.0)**2 + (lat - 15.0)**2) / 100.0)
                        
                        surf_temp = 28.6 + lat_gradient - upwelling_cooling + bob_warmth
                        # Deep ocean asymptotes to ~2.0°C - 1.5°C
                        val = round(2.0 + (surf_temp - 2.0) * depth_decay, 2)
                        
                    elif var_clean in ["salinity", "sal", "sss"]:
                        # Arabian Sea High Salinity Water (ASW) ~ 36.5 PSU
                        # Bay of Bengal River Plume (Ganges-Brahmaputra) ~ 31.5 PSU
                        arabian_high = 2.4 * math.exp(-((lon - 63.0)**2 + (lat - 18.0)**2) / 120.0)
                        bob_freshening = -3.8 * math.exp(-((lon - 89.0)**2 + (lat - 21.0)**2) / 80.0) * (1.0 - math.exp(-depth_m / 80.0))
                        
                        surf_sal = 34.6 + arabian_high + bob_freshening
                        # Deep salinity is around 34.7 - 34.8 PSU
                        val = round(34.75 + (surf_sal - 34.75) * depth_decay, 2)

                    elif var_clean in ["ssh", "elevation", "height"]:
                        # Sea surface height in meters (-0.6 to +0.8m)
                        eddy_signal = 0.25 * math.sin(lat * 0.4) * math.cos(lon * 0.3)
                        monsoon_tilt = 0.35 * (lon - 70.0) / 30.0 - 0.15 * (lat - 10.0) / 15.0
                        val = round(eddy_signal + monsoon_tilt, 3)

                    elif var_clean in ["velocity", "currents", "speed", "uv"]:
                        # Wyrtki Jet (Equatorial zonal flow)
                        wyrtki_u = 0.85 * math.exp(- (lat - 0.5)**2 / 6.0) * depth_decay
                        # Somali Current (Western boundary northward flow)
                        somali_v = 1.40 * math.exp(- ((lon - 53.0)**2 + (lat - 8.0)**2) / 45.0) * depth_decay
                        somali_u = 0.90 * math.exp(- ((lon - 53.0)**2 + (lat - 8.0)**2) / 45.0) * depth_decay
                        # East India Coastal Current (EICC)
                        eicc_v = 0.65 * math.exp(- ((lon - 82.0)**2 + (lat - 14.0)**2) / 25.0) * depth_decay
                        
                        # Background gyre circulation
                        u_bg = 0.15 * math.cos(lat * 0.3) * depth_decay
                        v_bg = -0.12 * math.sin(lon * 0.2) * depth_decay

                        u_val = round(wyrtki_u + somali_u + u_bg, 3)
                        v_val = round(somali_v + eicc_v + v_bg, 3)
                        speed = round(math.sqrt(u_val**2 + v_val**2), 3)
                        val = speed

                        if r % 2 == 0 and c % 2 == 0:
                            vectors.append({
                                "lat": lat,
                                "lon": lon,
                                "u": u_val,
                                "v": v_val,
                                "speed": speed,
                                "angle_deg": round(math.degrees(math.atan2(v_val, u_val)), 1)
                            })
                    else:
                        val = 0.0

                row_vals.append(val)
                if val is not None:
                    if val < min_val: min_val = val
                    if val > max_val: max_val = val

                if var_clean in ["velocity", "currents", "speed", "uv"]:
                    u_row.append(u_val)
                    v_row.append(v_val)

            grid_values.append(row_vals)
            if var_clean in ["velocity", "currents", "speed", "uv"]:
                u_grid.append(u_row)
                v_grid.append(v_row)

        if min_val == 9999.0:
            min_val = 0.0
            max_val = 1.0

        # Units & Palette
        unit_map = {
            "temperature": "°C",
            "salinity": "PSU",
            "velocity": "m/s",
            "currents": "m/s",
            "ssh": "m"
        }
        units = unit_map.get(var_clean, "units")

        return {
            "model_id": model_id,
            "variable": var_clean,
            "depth_m": depth_m,
            "units": units,
            "dimensions": {"n_lat": n_lat, "n_lon": n_lon},
            "latitudes": lats,
            "longitudes": lons,
            "grid_values": grid_values,
            "u_grid": u_grid if u_grid else None,
            "v_grid": v_grid if v_grid else None,
            "vectors": vectors,
            "min_value": round(min_val, 2),
            "max_value": round(max_val, 2),
            "date": date_str or "2026-09-04T12:00:00Z",
            "contour_levels": np.linspace(min_val, max_val, 8).round(2).tolist()
        }

    @classmethod
    def get_point_depth_profile(
        cls,
        model_id: str,
        lat: float,
        lon: float,
        variable: str = "temperature"
    ) -> Dict[str, Any]:
        """
        Extracts a high-resolution 1D vertical depth profile at coordinate (lat, lon).
        Calculates mixed layer depth (MLD) and potential density stratification.
        """
        depths = cls.get_depth_levels(model_id)
        var_clean = variable.lower()

        # Surface parameters based on location
        if lat < 5.0: # Equatorial
            surf_t = 29.1
            surf_s = 34.5
            mld = 45.0
            thermocline_depth = 110.0
        elif lon > 80.0: # Bay of Bengal
            surf_t = 29.4
            surf_s = 32.8 if lat > 15.0 else 33.8
            mld = 30.0
            thermocline_depth = 85.0
        else: # Arabian Sea
            surf_t = 27.8
            surf_s = 36.4
            mld = 60.0
            thermocline_depth = 130.0

        temp_profile = []
        sal_profile = []
        density_profile = []
        current_profile = []

        for d in depths:
            # Temperature equation: mixed layer + thermocline drop + deep abyssal decay
            if d <= mld:
                t = surf_t - 0.02 * (d / mld)
            else:
                drop = (surf_t - 2.2) * (1.0 - math.exp(-(d - mld) / (thermocline_depth * 1.8)))
                t = max(1.8, surf_t - drop)
            
            # Salinity equation
            if d <= 30 and surf_s < 34.0:
                s = surf_s + (34.8 - surf_s) * (d / 80.0)
            elif d > 30 and d <= 500:
                s = 34.8 + 0.3 * math.sin(d / 150.0)
            else:
                s = 34.72 + 0.05 * math.exp(-d / 2000.0)

            # UNESCO Equation of State approximation for Density (sigma-t = rho - 1000)
            sigma_t = round(28.1 - 0.22 * t + 0.78 * (s - 35.0) + 0.0045 * d, 2)
            
            # Velocity decay
            v_speed = max(0.02, round(0.85 * math.exp(-d / 180.0), 3))

            temp_profile.append(round(t, 2))
            sal_profile.append(round(s, 2))
            density_profile.append(sigma_t)
            current_profile.append(v_speed)

        selected_values = temp_profile if var_clean in ["temperature", "temp"] else (
            sal_profile if var_clean in ["salinity", "sal"] else current_profile
        )

        return {
            "model_id": model_id,
            "latitude": lat,
            "longitude": lon,
            "variable": var_clean,
            "depths": depths,
            "values": selected_values,
            "temperature_profile": temp_profile,
            "salinity_profile": sal_profile,
            "density_profile": density_profile,
            "velocity_profile": current_profile,
            "mixed_layer_depth_m": mld,
            "thermocline_depth_m": thermocline_depth,
            "surface_temp": temp_profile[0],
            "surface_sal": sal_profile[0],
            "bottom_temp": temp_profile[-1],
            "units": "°C" if var_clean in ["temperature", "temp"] else ("PSU" if var_clean in ["salinity", "sal"] else "m/s")
        }

    @classmethod
    def generate_vertical_transect(
        cls,
        model_id: str,
        transect_name: str = "equator",
        variable: str = "temperature"
    ) -> Dict[str, Any]:
        """
        Generates 2D vertical cross-section transect (Distance vs Depth).
        Preset Transects:
        1. 'equator': 0°N, 55°E to 95°E (Equatorial Undercurrent & Wyrtki Jets)
        2. 'bob_meridional': 88°E, 5°N to 21°N (BoB Freshwater Plume & Thermocline Slope)
        3. 'arabian_zonal': 15°N, 52°E to 73°E (Somali Upwelling & West Coast)
        """
        var_clean = variable.lower()
        depths = [0, 10, 25, 50, 75, 100, 150, 200, 300, 400, 500, 750, 1000, 1500, 2000]

        if transect_name == "equator":
            title = "Equatorial Indian Ocean Zonal Transect (0°N, 55°E–95°E)"
            coords_label = "Longitude (°E)"
            coords_points = [55.0, 60.0, 65.0, 70.0, 75.0, 80.0, 85.0, 90.0, 95.0]
            lat_ref = 0.0
        elif transect_name == "bob_meridional":
            title = "Bay of Bengal Meridional Section (88°E, 4°N–22°N)"
            coords_label = "Latitude (°N)"
            coords_points = [4.0, 6.0, 8.0, 10.0, 12.0, 14.0, 16.0, 18.0, 20.0, 22.0]
            lat_ref = None
        else: # arabian_zonal
            title = "Arabian Sea Upwelling Section (15°N, 52°E–74°E)"
            coords_label = "Longitude (°E)"
            coords_points = [52.0, 55.0, 58.0, 62.0, 66.0, 70.0, 74.0]
            lat_ref = 15.0

        # Matrix: depth x coordinate
        matrix_data = []
        thermocline_line = []

        min_val = 9999.0
        max_val = -9999.0

        for d in depths:
            row = []
            for p in coords_points:
                lat = lat_ref if lat_ref is not None else p
                lon = p if lat_ref is not None else 88.0

                prof = cls.get_point_depth_profile(model_id, lat, lon, var_clean)
                # Find matching depth value
                idx = 0
                for di, depth_val in enumerate(prof["depths"]):
                    if depth_val <= d:
                        idx = di
                val = prof["values"][idx]
                row.append(val)
                if val < min_val: min_val = val
                if val > max_val: max_val = val
            matrix_data.append(row)

        for p in coords_points:
            lat = lat_ref if lat_ref is not None else p
            lon = p if lat_ref is not None else 88.0
            prof = cls.get_point_depth_profile(model_id, lat, lon, var_clean)
            thermocline_line.append(prof["thermocline_depth_m"])

        return {
            "model_id": model_id,
            "transect_name": transect_name,
            "title": title,
            "variable": var_clean,
            "units": "°C" if var_clean in ["temperature", "temp"] else ("PSU" if var_clean in ["salinity", "sal"] else "m/s"),
            "coords_label": coords_label,
            "coords_points": coords_points,
            "depths": depths,
            "matrix_data": matrix_data,
            "thermocline_depths": thermocline_line,
            "min_val": round(min_val, 2),
            "max_val": round(max_val, 2)
        }
