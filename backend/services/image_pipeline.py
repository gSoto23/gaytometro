import io
import hashlib
from datetime import datetime
from PIL import Image, ImageOps

MAX_SIZE = 1080

def process_image(file_bytes: bytes) -> tuple[bytes, str]:
    """
    1. Valida que sea una imagen (Image.open lo hace).
    2. Elimina EXIF y corrige rotación (ImageOps.exif_transpose).
    3. Redimensiona (thumbnail mantiene el aspect ratio, máx 1080px).
    4. Convierte a WebP (80% calidad).
    5. Genera un hash SHA-256 + timestamp para el nombre.
    Retorna los bytes procesados y el nombre de archivo sugerido.
    """
    try:
        # Abrir imagen y leerla
        img = Image.open(io.BytesIO(file_bytes))
        
        # Eliminar EXIF pero aplicar la rotación correcta basada en la metadata original
        img = ImageOps.exif_transpose(img)
        
        # Redimensionar (máximo 1080px del lado más largo)
        img.thumbnail((MAX_SIZE, MAX_SIZE), Image.Resampling.LANCZOS)
        
        # Guardar en memoria como WebP
        output_buffer = io.BytesIO()
        img.save(output_buffer, format="WEBP", quality=80)
        processed_bytes = output_buffer.getvalue()
        
        # Generar nombre único: sha256(bytes originales) + timestamp
        file_hash = hashlib.sha256(file_bytes).hexdigest()[:16]
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"{timestamp}_{file_hash}.webp"
        
        return processed_bytes, filename
    except Exception as e:
        raise ValueError(f"Archivo de imagen inválido o corrupto: {str(e)}")
