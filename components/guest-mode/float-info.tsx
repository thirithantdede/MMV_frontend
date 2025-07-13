import { Clock } from "lucide-react";
import { formatWalkingTime, getPathStatistics } from "@/utils/pathfinding";
import { RouteInfo } from "@/types";
import { useMemo } from "react";
import { useMapEditor } from "@/context/map-editor-context";
import { Badge } from "@/components/ui/badge";

interface FloatInfoProps {
  routeInfo: RouteInfo;
  currentFloor: number;
}
const FloatInfo = ({ routeInfo, currentFloor }: FloatInfoProps) => {

    const { mapSettings } = useMapEditor();


  const pathStats = useMemo(() => {
    if (!mapSettings || routeInfo.path.length === 0) {
      return {
        totalDistance: 0,
        walkingTime: 0,
        transitionCount: 0,
        floors: []
      };
    }
    return getPathStatistics(routeInfo.path, mapSettings);
  }, [routeInfo.path, mapSettings]);



  return (
    <div>
      {pathStats.walkingTime > 0 && routeInfo.path.length > 1 && (
        <div
          className="absolute z-30 bg-background/95 backdrop-blur-sm border border-border shadow-lg rounded-lg"
          style={{
            top: "80px",
            left: "20px",
          }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-foreground">
                {formatWalkingTime(pathStats.walkingTime)}
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round(pathStats.totalDistance)}m • walking time
              </div>
            </div>
            {pathStats.transitionCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {pathStats.transitionCount} floor{pathStats.transitionCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      )}
      
    </div>
  );
};

export default FloatInfo;
