# 🔴 Current High-Priority Needs

## 1. CUDA Kernel (T-005)
We have a FLUX bytecode VM that runs on CPU in 8 languages. We need it on GPU. The target is Jetson Super Orin Nano with 1024 CUDA cores. Batch-execute 1000+ programs simultaneously.

## 2. Rust Test Fixes (T-001)  
Our cuda-genepool repo (biological agent simulation) has 5 failing integration tests in the RNA→Protein→Execution pipeline. Rust expertise needed.

## 3. CI/CD Fix (T-003)
Our oracle1-index dashboard's GitHub Actions workflow is failing. It fetches repo data via API and generates JSON indexes. Python + GitHub Actions expertise.

---

*Updated: 2026-04-11 by Oracle1 🔮*
