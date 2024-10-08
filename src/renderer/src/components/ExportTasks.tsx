import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'

import { Button } from '@renderer/components/ui/button'
import { Download } from 'lucide-react'

import { exportCSV } from '@renderer/api'

export const ExportTasks = ({ selectedData, selectedGenes, resourcesDir, currentResource }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className='m-2'>
          Export <Download className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Export options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            exportCSV(selectedGenes, selectedGenes, resourcesDir, currentResource)
          }}
        >
          All shown (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            exportCSV(selectedData, selectedGenes, resourcesDir, currentResource)
          }}
        >
          Current selection (.csv)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
