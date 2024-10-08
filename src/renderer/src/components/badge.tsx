import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import { CircleX } from 'lucide-react'

const GeneBadge = ({ gene, handleBadgeClick, removeGene, isHighlighted }) => {
  return (
    <Badge
      key={gene}
      variant="outline"
      className={`h-8 hover:cursor-pointer ${isHighlighted ? 'bg-yellow-300' : ''}`}
      onClick={() => handleBadgeClick(gene)}
    >
      <>
        {gene}
        <Button
          onClick={() => removeGene(gene)}
          variant="ghost"
          className="px-2 py-1 hover:bg-transparent	"
        >
          <CircleX width="1rem" />
        </Button>
      </>
    </Badge>
  )
}

export default GeneBadge
