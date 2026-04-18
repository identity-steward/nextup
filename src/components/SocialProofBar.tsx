import { Star, Users, Video, Eye } from 'lucide-react';

export default function SocialProofBar() {
  return (
    <div className="bg-white border-y border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
            </div>
            <span className="font-semibold text-gray-900">12 supporters</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <Video className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="font-semibold text-gray-900">4 highlight reels</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
              <Eye className="w-4 h-4 text-sky-600" />
            </div>
            <span className="font-semibold text-gray-900">3K views</span>
          </div>
        </div>
      </div>
    </div>
  );
}
