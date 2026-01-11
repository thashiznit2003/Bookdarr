using System;
using System.Collections.Generic;
using NzbDrone.Core.Books;

namespace Readarr.Api.V1.Books
{
    public class ManualBookResource
    {
        public string Title { get; set; }
        public string AuthorName { get; set; }
        public DateTime? ReleaseDate { get; set; }
        public string Overview { get; set; }
        public string Publisher { get; set; }
        public string Language { get; set; }
        public string Format { get; set; }
        public string Isbn13 { get; set; }
        public string Asin { get; set; }
        public string Disambiguation { get; set; }
        public int PageCount { get; set; }
        public bool IsEbook { get; set; }

        public string RootFolderPath { get; set; }
        public MonitorTypes Monitor { get; set; }
        public NewItemMonitorTypes MonitorNewItems { get; set; }
        public int QualityProfileId { get; set; }
        public int MetadataProfileId { get; set; }
        public HashSet<int> Tags { get; set; }
    }

    public static class ManualBookResourceMapper
    {
        public static ManualBookDefinition ToDefinition(this ManualBookResource resource)
        {
            if (resource == null)
            {
                return null;
            }

            return new ManualBookDefinition
            {
                Title = resource.Title,
                AuthorName = resource.AuthorName,
                ReleaseDate = resource.ReleaseDate,
                Overview = resource.Overview,
                Publisher = resource.Publisher,
                Language = resource.Language,
                Format = resource.Format,
                Isbn13 = resource.Isbn13,
                Asin = resource.Asin,
                Disambiguation = resource.Disambiguation,
                PageCount = resource.PageCount,
                IsEbook = resource.IsEbook,
                RootFolderPath = resource.RootFolderPath,
                Monitor = resource.Monitor,
                MonitorNewItems = resource.MonitorNewItems,
                QualityProfileId = resource.QualityProfileId,
                MetadataProfileId = resource.MetadataProfileId,
                Tags = resource.Tags
            };
        }
    }
}
