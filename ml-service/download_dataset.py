import kagglehub

# Download latest version
path = kagglehub.dataset_download(
    "kevinnadar22/mumbai-house-price-data-70k-entries"
)

print("Path to dataset files:", path)