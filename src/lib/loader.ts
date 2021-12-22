const loader = (image_id_array: number[], callback: (arg0: any[]) => void, on_progress: (arg0: any) => void) => {
    const loaded_images: any[] = [];
    image_id_array.forEach((id: number) => {
        const img = new Image();
        img.src = `/images/${id}.png`
        img.onload = () => {
            console.log('load')

            loaded_images.push({
                id, img
            });
            if (on_progress) {
                const progress = parseFloat((loaded_images.length / image_id_array.length).toFixed(2))
                on_progress(progress)
                if (loaded_images.length === image_id_array.length) {
                    console.log('all images loaded')
                    callback(loaded_images)
                }
            }
        }
    });
}

export default loader