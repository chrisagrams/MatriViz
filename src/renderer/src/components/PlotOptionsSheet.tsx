import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { Checkbox } from '@renderer/components/ui/checkbox'

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@renderer/components/ui/sheet'
import { PlotState } from '@renderer/types'

/* Lucide */
import { Settings } from 'lucide-react'

export const PlotOptionsSheet = ({
  plotState,
  setPlotState
}: {
  plotState: PlotState
  setPlotState: (plotState: PlotState) => void
}): JSX.Element => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="absolute left-4 top-4 gap-2" variant="outline">
          <Settings></Settings>Plot Options
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-1/3 sm:max-w-full">
        <SheetHeader>
          <SheetTitle>Plot Options</SheetTitle>
          <SheetDescription>Adjust scale, colors, and other plot options.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minColor">Minimum Score Color</Label>
            <Input
              id="minColor"
              value={plotState.minColor}
              onChange={(event) => setPlotState({ ...plotState, minColor: event.target.value })}
              type="color"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxColor">Maximum Score Color</Label>
            <Input
              id="maxColor"
              value={plotState.maxColor}
              onChange={(event) => setPlotState({ ...plotState, maxColor: event.target.value })}
              type="color"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minScore">Minimum Score</Label>
            <Input
              id="minScore"
              value={plotState.minScore}
              onChange={(event) =>
                setPlotState({ ...plotState, minScore: Number(event.target.value) })
              }
              type="number"
              disabled={plotState.autoMinScore}
              step={0.1}
            />
            <div className="grid grid-cols-4 items-center gap-4">
              <Checkbox
                id="maxColorAuto"
                checked={plotState.autoMinScore}
                onCheckedChange={(event) =>
                  setPlotState({ ...plotState, autoMinScore: Boolean(event) })
                }
              ></Checkbox>
              <label
                htmlFor="maxColorAuto"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Auto
              </label>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxScore">Maximum Score</Label>
            <Input
              id="maxScore"
              value={plotState.maxScore}
              onChange={(event) =>
                setPlotState({ ...plotState, maxScore: Number(event.target.value) })
              }
              type="number"
              disabled={plotState.autoMaxScore}
              step={0.1}
            />
            <div className="grid grid-cols-4 items-center gap-4">
              <Checkbox
                id="maxColorAuto"
                checked={plotState.autoMaxScore}
                onCheckedChange={(event) =>
                  setPlotState({ ...plotState, autoMaxScore: Boolean(event) })
                }
              ></Checkbox>
              <label
                htmlFor="maxColorAuto"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Auto
              </label>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pointSize">Point Size</Label>
            <Input
              id="pointSize"
              value={plotState.pointSize}
              onChange={(event) =>
                setPlotState({ ...plotState, pointSize: Number(event.target.value) })
              }
              type="number"
              step={0.1}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gridlines">Grid Lines</Label>
            <Checkbox
              id="gridlines"
              checked={plotState.toggleGridlines}
              onCheckedChange={(event) =>
                setPlotState({ ...plotState, toggleGridlines: Boolean(event) })
              }
            ></Checkbox>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Apply</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
