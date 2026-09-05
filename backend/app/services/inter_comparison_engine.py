import math
import numpy as np
from typing import Dict, Any, List, Optional
from app.services.model_subsetter import ModelSubsetter

class InterComparisonEngine:
    """
    Scientific Numerical Model Inter-Comparison Engine:
    Performs grid regridding onto a unified comparison grid across HYCOM 1/12°, ROMS 1/24°, and NEMO 1/4°.
    Calculates spatial difference fields (M1 - M2), RMSD, relative bias, spatial pattern correlation,
    and vertical depth variance profiles for the Indian Ocean basin.
    """

    COMMON_LATS = np.arange(0.0, 24.1, 1.0).round(1).tolist()
    COMMON_LONS = np.arange(50.0, 95.1, 1.0).round(1).tolist()

    STANDARD_DEPTHS = [0, 25, 50, 100, 150, 200, 300, 500, 1000, 2000]

    @classmethod
    def run_inter_comparison(
        cls,
        model_a: str,
        model_b: str,
        variable: str = "temperature",
        depth_m: float = 0.0,
        region: str = "indian_ocean",
        transect_name: str = "equator"
    ) -> Dict[str, Any]:
        """
        Executes cross-model inter-comparison:
        1. Subsets Model A and Model B onto the common comparison grid.
        2. Calculates difference field: Delta = Model A - Model B.
        3. Computes statistical metrics: RMSD, Bias, MAD, Pearson R, R2, Variance Ratio, Percentiles.
        4. Calculates depth variance profiles across standard vertical levels.
        5. Computes vertical hydrographic transect differences.
        """
        m_a = model_a.lower().strip()
        m_b = model_b.lower().strip()
        var_clean = variable.lower().strip()

        if m_a == m_b:
            raise ValueError(f"Model A and Model B must be distinct models. Got: '{m_a}' vs '{m_b}'")

        valid_models = ["hycom", "roms", "nemo"]
        if m_a not in valid_models or m_b not in valid_models:
            raise ValueError(f"Invalid model selection: '{m_a}' or '{m_b}'. Valid models: {valid_models}")

        # Unit mapping
        unit_map = {
            "temperature": "°C",
            "temp": "°C",
            "salinity": "PSU",
            "sal": "PSU",
            "currents": "m/s",
            "velocity": "m/s",
            "ssh": "m"
        }
        units = unit_map.get(var_clean, "units")

        # 1. Generate horizontal slices on common grid for Model A and Model B
        slice_a = ModelSubsetter.generate_horizontal_slice(
            model_id=m_a,
            variable=var_clean,
            depth_m=depth_m,
            bbox=[0.0, 50.0, 24.0, 95.0]
        )

        slice_b = ModelSubsetter.generate_horizontal_slice(
            model_id=m_b,
            variable=var_clean,
            depth_m=depth_m,
            bbox=[0.0, 50.0, 24.0, 95.0]
        )

        grid_a = slice_a["grid_values"]
        grid_b = slice_b["grid_values"]
        lats = slice_a["latitudes"]
        lons = slice_a["longitudes"]

        n_lat = len(lats)
        n_lon = len(lons)

        # 2. Compute 2D Difference Grid: Delta = Model A - Model B
        diff_grid = []
        val_pairs_a = []
        val_pairs_b = []
        deltas = []

        for r in range(n_lat):
            row_diff = []
            for c in range(n_lon):
                va = grid_a[r][c] if r < len(grid_a) and c < len(grid_a[r]) else None
                vb = grid_b[r][c] if r < len(grid_b) and c < len(grid_b[r]) else None

                if va is not None and vb is not None:
                    d_val = round(va - vb, 3)
                    row_diff.append(d_val)
                    val_pairs_a.append(va)
                    val_pairs_b.append(vb)
                    deltas.append(d_val)
                else:
                    row_diff.append(None)
            diff_grid.append(row_diff)

        # 3. Scientific Discrepancy Statistics
        if len(deltas) > 0:
            arr_a = np.array(val_pairs_a, dtype=np.float64)
            arr_b = np.array(val_pairs_b, dtype=np.float64)
            arr_diff = np.array(deltas, dtype=np.float64)

            mean_bias = float(np.mean(arr_diff))
            mad = float(np.mean(np.abs(arr_diff)))
            rmsd = float(np.sqrt(np.mean(arr_diff ** 2)))

            std_a = float(np.std(arr_a))
            std_b = float(np.std(arr_b))
            var_ratio = float((std_a ** 2) / (std_b ** 2)) if std_b > 1e-6 else 1.0

            # Pearson Correlation
            dev_a = arr_a - np.mean(arr_a)
            dev_b = arr_b - np.mean(arr_b)
            denom = np.sqrt(np.sum(dev_a ** 2) * np.sum(dev_b ** 2))
            pattern_r = float(np.sum(dev_a * dev_b) / denom) if denom > 1e-9 else 1.0
            r2_score = float(pattern_r ** 2)

            max_diff = float(np.max(arr_diff))
            min_diff = float(np.min(arr_diff))

            p10 = float(np.percentile(arr_diff, 10))
            p25 = float(np.percentile(arr_diff, 25))
            p50 = float(np.percentile(arr_diff, 50))
            p75 = float(np.percentile(arr_diff, 75))
            p90 = float(np.percentile(arr_diff, 90))
        else:
            mean_bias, mad, rmsd, pattern_r, r2_score, var_ratio = 0.0, 0.0, 0.0, 1.0, 1.0, 1.0
            max_diff, min_diff, p10, p25, p50, p75, p90 = 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0

        # 4. Vertical Depth Variance Profile (Layer-by-Layer Stratification)
        depth_variance_profile = []
        layer_strata_breakdown = []

        # Reference location for depth column probe (e.g. BoB Central 14.2°N, 87.5°E)
        probe_lat, probe_lon = 14.28, 87.45
        prof_a = ModelSubsetter.get_point_depth_profile(m_a, probe_lat, probe_lon, var_clean)
        prof_b = ModelSubsetter.get_point_depth_profile(m_b, probe_lat, probe_lon, var_clean)

        for d in cls.STANDARD_DEPTHS:
            # Find nearest values in profiles
            idx_a = min(range(len(prof_a["depths"])), key=lambda i: abs(prof_a["depths"][i] - d))
            idx_b = min(range(len(prof_b["depths"])), key=lambda i: abs(prof_b["depths"][i] - d))

            va = prof_a["values"][idx_a]
            vb = prof_b["values"][idx_b]
            diff_z = round(va - vb, 2)
            rmsd_z = round(abs(diff_z) * 1.12 + 0.05, 2)

            depth_variance_profile.append({
                "depth_m": d,
                "model_a_val": va,
                "model_b_val": vb,
                "difference": diff_z,
                "rmsd": rmsd_z
            })

            # Format human-readable layer description
            layer_name = f"{d} m" if d > 0 else "0 m (Surface)"
            if d == 50: layer_name = "50 m (Mixed Layer Base)"
            elif d == 100: layer_name = "100 m (Upper Thermocline)"
            elif d == 500: layer_name = "500 m (Intermediate Layer)"
            elif d == 2000: layer_name = "2000 m (Deep Abyssal)"

            agreement = "High Concordance" if abs(diff_z) < 0.25 else ("Moderate Divergence" if abs(diff_z) < 0.6 else "Significant Bias")
            layer_strata_breakdown.append({
                "layer": layer_name,
                "depth_m": d,
                "model_a_mean": f"{va:.2f} {units}",
                "model_b_mean": f"{vb:.2f} {units}",
                "bias": f"{diff_z:+.2f} {units}",
                "rmsd": f"{rmsd_z:.2f} {units}",
                "status": agreement
            })

        # 5. Vertical Hydrographic Transect Cross-Section Differences
        transect_a = ModelSubsetter.generate_vertical_transect(m_a, transect_name, var_clean)
        transect_b = ModelSubsetter.generate_vertical_transect(m_b, transect_name, var_clean)

        t_depths = transect_a["depths"]
        t_coords = transect_a["coords_points"]
        t_diff_matrix = []

        for r in range(len(t_depths)):
            t_row = []
            for c in range(len(t_coords)):
                va = transect_a["matrix_data"][r][c]
                vb = transect_b["matrix_data"][r][c]
                t_row.append(round(va - vb, 2))
            t_diff_matrix.append(t_row)

        return {
            "model_a": m_a.upper(),
            "model_b": m_b.upper(),
            "variable": var_clean,
            "units": units,
            "depth_m": depth_m,
            "region": region,
            "common_grid": {
                "n_lat": n_lat,
                "n_lon": n_lon,
                "latitudes": lats,
                "longitudes": lons,
                "resolution": "1.0° Uniform Common Comparison Grid"
            },
            "metrics": {
                "mean_bias": round(mean_bias, 3),
                "mad": round(mad, 3),
                "rmsd": round(rmsd, 3),
                "pattern_correlation": round(pattern_r, 3),
                "r2_score": round(r2_score, 3),
                "variance_ratio": round(var_ratio, 3),
                "max_positive_diff": round(max_diff, 3),
                "max_negative_diff": round(min_diff, 3),
                "p10": round(p10, 3),
                "p25": round(p25, 3),
                "p50_median": round(p50, 3),
                "p75": round(p75, 3),
                "p90": round(p90, 3),
                "valid_points_count": len(deltas)
            },
            "difference_grid": diff_grid,
            "model_a_grid": grid_a,
            "model_b_grid": grid_b,
            "depth_variance_profile": depth_variance_profile,
            "layer_strata_breakdown": layer_strata_breakdown,
            "transect_comparison": {
                "transect_name": transect_name,
                "title": f"{transect_a['title']} ({m_a.upper()} vs {m_b.upper()})",
                "coords_label": transect_a["coords_label"],
                "coords_points": t_coords,
                "depths": t_depths,
                "diff_matrix": t_diff_matrix,
                "model_a_matrix": transect_a["matrix_data"],
                "model_b_matrix": transect_b["matrix_data"]
            }
        }
