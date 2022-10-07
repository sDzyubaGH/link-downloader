function dowloadFile(url) {
  // Отображение лоадера
  document.querySelector('.modal').classList.add('active')
  setTimeout(() => {
    fetch(url)
      .then(res => {
        if (!res.ok) {
          const error = new Error(res.statusText)
          throw error
        }

        return res.blob()
      })
      .then(data => {
        let objUrl = URL.createObjectURL(data)

        let anchor = document.createElement('a')
        anchor.href = objUrl
        const fName = getFname(url)
        anchor.download = fName
        document.body.append(anchor)
        anchor.style = 'display: none'
        anchor.click()
        anchor.remove()
      })
      .catch((e) => {
        console.log('Файл не найден')
      })
      .finally(() => {
        document.querySelector('.modal').classList.remove('active')
      })
  }, 1000)
}

// Получение имени файла из URL
function getFname(url) {
  const fName = url.split('/')[url.split('/').length - 1]

  return fName
}

// Скачивание отдельных файлов
const btns = document.querySelectorAll('.attached_file > button')
btns.forEach(btn => {
  btn.addEventListener('click', e => {
    const url = e.target.parentNode.children[0].value
    if (!url) {
      console.log('Файл не найден')
      return null
    }

    dowloadFile(url)
  })
})

// Загрузка архива
const archiveBtn = document.querySelector('.download_archive')
archiveBtn.addEventListener('click', e => {
  const urls = [...document.querySelectorAll('input')].map(input => input.value ? input.value : null)

  document.querySelector('.modal').classList.add('active')
  setTimeout(() => {
    Promise.all(
      urls.map((url, i) =>
        fetch(url)
          .then(res => {
            if (!res.ok || !url) {
              const error = new Error(res.statusText)
              throw error
            }

            fName = getFname(url)
            return [res.blob(), fName]
          })
          .catch(e => {
            console.log("Файл не найден")
          })
      )
    )
      .then(result => {
        const zip = new JSZip();

        let f = false
        result.forEach((file, i) => {
          if (!file) {
            return null
          }

          f = true
          zip.file(file[1], file[0])
        })

        f
          ? zip.generateAsync({ type: "base64" })
            .then(function (base64) {
              window.location = "data:application/zip;base64," + base64;
            })
          : console.log('Ни один файл не найден')
      })
      .finally(() => {
        document.querySelector('.modal').classList.remove('active')
      })
  }, 1000)
})
