import numpy as np
from typing import Dict, Any, List

def compute_ocean_metrics(obs: List[float], pred: List[float]) -> Dict[str, float]:
    """
    Computes standard oceanographic statistical validation metrics:
    - Mean Bias: mean(pred - obs)
    - Mean Absolute Error (MAE): mean(|pred - obs|)
    - Root Mean Square Error (RMSE): sqrt(mean((pred - obs)^2))
    - Pearson Correlation Coefficient (r)
    - Coefficient of Determination (r^2)
    - Willmott Index of Agreement (d)
    """
    o = np.array(obs, dtype=np.float64)
    p = np.array(pred, dtype=np.float64)

    if len(o) == 0 or len(p) == 0 or len(o) != len(p):
        return {
            "mean_bias": 0.0,
            "mae": 0.0,
            "rmse": 0.0,
            "pearson_r": 0.0,
            "r2_score": 0.0,
            "willmott_index": 0.0,
            "sample_pairs": 0,
        }

    diff = p - o
    bias = float(np.mean(diff))
    mae = float(np.mean(np.abs(diff)))
    rmse = float(np.sqrt(np.mean(diff ** 2)))

    # Pearson r
    o_mean = np.mean(o)
    p_mean = np.mean(p)
    o_dev = o - o_mean
    p_dev = p - p_mean

    denom = np.sqrt(np.sum(o_dev ** 2) * np.sum(p_dev ** 2))
    if denom > 1e-9:
        r = float(np.sum(o_dev * p_dev) / denom)
    else:
        r = 1.0

    r2 = float(r ** 2)

    # Willmott Index of Agreement (d)
    # d = 1 - [sum((p - o)^2) / sum((|p - o_mean| + |o - o_mean|)^2)]
    numerator = np.sum(diff ** 2)
    denominator = np.sum((np.abs(p - o_mean) + np.abs(o - o_mean)) ** 2)
    
    if denominator > 1e-9:
        willmott = float(1.0 - (numerator / denominator))
    else:
        willmott = 1.0

    return {
        "mean_bias": round(bias, 4),
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "pearson_r": round(r, 4),
        "r2_score": round(r2, 4),
        "willmott_index": round(willmott, 4),
        "sample_pairs": len(o),
    }
