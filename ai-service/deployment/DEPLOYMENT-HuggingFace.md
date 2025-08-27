# 🤗 HuggingFace Spaces Deployment Guide

## 🎯 Overview

Deploy the RAG Pipeline Demo to **HuggingFace Spaces** with 16GB RAM for free!

## 🚀 Quick Deploy

### Option 1: Automatic GitHub Actions Deploy

1. **Set up secrets** in your GitHub repository:
   ```
   Settings → Secrets and variables → Actions → Repository secrets
   
   Add these secrets:
   - HF_TOKEN: Your HuggingFace API token
   - HF_USERNAME: Your HuggingFace username
   ```

2. **Get HuggingFace Token**:
   - Go to https://huggingface.co/settings/tokens
   - Create a new token with "Write" permissions
   - Copy the token to GitHub secrets as `HF_TOKEN`

3. **Deploy**:
   ```bash
   # Push changes to main or staging branch (affects ai-service directory)
   git add .
   git commit -m "Update RAG demo for HuggingFace Spaces"
   git push origin main  # or staging
   ```
   
4. **Monitor**: GitHub Actions will automatically deploy to HuggingFace Spaces

### Option 2: Manual Deploy via HuggingFace Hub

1. **Install HuggingFace CLI**:
   ```bash
   pip install huggingface_hub
   huggingface-cli login
   ```

2. **Create Space**:
   ```bash
   # Navigate to ai-service directory
   cd ai-service
   
   # Copy HF-specific README
   cp README-HuggingFace.md README.md
   
   # Create and upload space
   python -c "
   from huggingface_hub import HfApi, create_repo
   
   api = HfApi()
   repo_id = 'YOUR_USERNAME/rag-pipeline-demo'
   
   # Create space
   create_repo(
       repo_id=repo_id,
       repo_type='space',
       space_sdk='gradio'
   )
   
   # Upload files
   api.upload_folder(
       folder_path='.',
       repo_id=repo_id,
       repo_type='space',
       ignore_patterns=['__pycache__', '*.pyc', 'docker-compose*', 'Dockerfile*']
   )
   print(f'✅ Space created: https://huggingface.co/spaces/{repo_id}')
   "
   ```

### Option 3: Web Interface Upload

1. **Go to HuggingFace Spaces**: https://huggingface.co/spaces
2. **Click "Create new Space"**
3. **Configure**:
   - Owner: Your username
   - Space name: `rag-pipeline-demo`  
   - License: MIT
   - SDK: Gradio
   - Hardware: CPU basic (16GB RAM) - Free!
4. **Upload files**:
   - `app.py` (entry point)
   - `main_demo.py` (demo logic)
   - `requirements.txt` (dependencies)
   - `README.md` (from README-HuggingFace.md)
   - All `app/` directory files
   - All `docs/` directory files

## ⚙️ Configuration

### Required Files for HuggingFace Spaces

```
ai-service/
├── app.py                    # HF Spaces entry point ✅
├── main_demo.py             # Demo application ✅  
├── requirements-demo.txt    # HF-optimized dependencies ✅
├── README.md               # HF Spaces metadata ✅
├── app/                    # Application modules ✅
│   ├── demo/              # RAG demo classes
│   └── ...
└── docs/                  # Sample documents ✅
    └── projects/
```

### Environment Variables (Auto-set)

The `app.py` automatically configures:

```python
ENV_TYPE=demo
EMBEDDING_SERVICE_TYPE=local  
LLM_SERVICE_TYPE=mock
VECTOR_STORE_TYPE=memory
ENABLE_GRADIO_DEMO=true
```

### Hardware Settings

**Recommended**: CPU basic (16GB RAM)
- ✅ **Free tier**
- ✅ **Sufficient for ML models** 
- ✅ **16GB RAM** (vs Railway's 512MB)
- ✅ **Unlimited storage**

**Optional upgrades**:
- CPU upgraded ($9/month) - More CPU power
- GPU T4 small ($0.60/hour) - GPU acceleration

## 🎮 Features Available

Once deployed, your HuggingFace Space will provide:

### ✅ **Full RAG Pipeline**
- Real sentence-transformers embeddings
- Actual vector similarity search
- Document upload and processing
- Live performance metrics

### ✅ **Interactive UI**
- 📄 Document Upload & Processing
- 🔍 Vector Similarity Search  
- 🧮 Embedding Generation & Analysis
- 🤖 RAG-based Response Generation
- 🗄️ Vector Store Management

### ✅ **Educational Value**
- Step-by-step RAG pipeline demonstration
- Real-time embedding generation
- Similarity score explanations
- Performance monitoring

## 🌐 Access Your Demo

After deployment:

```
🌍 Space URL: https://huggingface.co/spaces/YOUR_USERNAME/rag-pipeline-demo
📊 Settings: https://huggingface.co/spaces/YOUR_USERNAME/rag-pipeline-demo/settings
📈 Logs: https://huggingface.co/spaces/YOUR_USERNAME/rag-pipeline-demo/logs
```

## 🔧 Local Testing

Test the HF Spaces version locally:

```bash
# Set environment for HF Spaces compatibility  
export ENV_TYPE=demo
export EMBEDDING_SERVICE_TYPE=local
export ENABLE_GRADIO_DEMO=true

# Run the HF Spaces app locally
cd ai-service
python app.py

# Access at http://localhost:7860 (HF Spaces port)
```

## 📊 Cost Analysis

```yaml
HuggingFace Spaces - Free Tier:
  ✅ Cost: $0/month
  ✅ Hardware: 16GB RAM CPU basic  
  ✅ Storage: Unlimited
  ✅ Bandwidth: Unlimited
  ✅ Uptime: 72h inactivity sleep (auto-wake)
  
Comparison:
  - Railway Hobby: $0 but insufficient resources ❌
  - Railway Pro: $20/month ❌
  - Google Colab: Limited session time ❌
  - HuggingFace Spaces: Perfect fit! ✅
```

## 🛠 Troubleshooting

### Common Issues

1. **Slow First Load**
   ```
   Problem: Initial model download takes 5-10 minutes
   Solution: Expected - models download on first run
   Status: Shows "Building" in HF Spaces interface
   ```

2. **Memory Issues**
   ```
   Problem: Out of memory errors
   Solution: Ensure using CPU Basic (16GB) hardware
   Check: Space Settings → Hardware
   ```

3. **Import Errors**
   ```
   Problem: Module not found errors
   Solution: Check requirements.txt includes all dependencies
   Verify: All app/ directory files uploaded
   ```

4. **Space Sleeping**
   ```
   Problem: Space goes to sleep after 72h inactivity
   Solution: Normal behavior - will auto-wake on visit
   Status: Shows "Sleeping" badge on space page
   ```

### Debug Steps

1. **Check Logs**:
   - Visit: `https://huggingface.co/spaces/YOUR_USERNAME/rag-pipeline-demo/logs`
   - Look for Python errors and missing modules

2. **Verify Files**:
   - Ensure all required files are uploaded
   - Check file permissions and structure

3. **Test Locally**:
   ```bash
   cd ai-service  
   python app.py
   # Should work identically to HF Spaces
   ```

## 🔄 Updates & Maintenance

### Auto-deployment
- Push to `main` or `staging` branch (affecting ai-service directory) triggers GitHub Actions
- Files automatically sync to HuggingFace Spaces
- Zero-downtime updates

### Manual Updates
```bash
# Update space manually
huggingface-cli upload YOUR_USERNAME/rag-pipeline-demo ./ai-service --repo-type=space
```

### Monitoring
- **Space Activity**: Monitor usage via HF dashboard
- **Performance**: Check logs for response times
- **Errors**: Review error logs for issues

## 🎯 Next Steps

1. ✅ **Deploy the space** using one of the methods above
2. ✅ **Test with sample documents** to verify functionality  
3. ✅ **Share the space URL** for RAG education and demonstration
4. 📈 **Monitor usage** and upgrade hardware if needed
5. 🔄 **Iterate and improve** based on user feedback

---

**🎉 Your RAG Demo is now live on HuggingFace Spaces for FREE!**

Experience real vector search, embedding generation, and RAG pipeline processing with 16GB RAM and unlimited storage.