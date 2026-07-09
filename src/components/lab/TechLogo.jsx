import { getTechLogoUrl } from '../../constants/techLogos.js'

function TechLogo({ name, size = 20 }) {
  return (
    <img
      src={getTechLogoUrl(name)}
      alt=""
      width={size}
      height={size}
      className="opacity-80"
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.display = 'none'
      }}
    />
  )
}

export default TechLogo
